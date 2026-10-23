import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
const { render: renderDom, fireEvent, act, cleanup: cleanupDom } = require('@testing-library/react');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function loadPage(file, auth, { configured = true } = {}) {
  const navigations = [];
  const exports = {};
  const router = { replace: path => navigations.push(path), refresh() {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = {
    exports,
    window: { location: { origin: 'https://example.test', assign: path => navigations.push(path) } },
    require: id => {
      if (id === 'next/navigation') return { useRouter: () => router };
      if (id === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
      if (id.includes('glass-card')) return { __esModule: true, default: ({ children }) => React.createElement('div', null, children) };
      if (id === '@supabase/ssr') return { createBrowserClient: () => ({ auth }) };
      if (id.includes('lib/mvp/env')) return { hasSupabaseEnv: () => configured };
      return require(id);
    },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.test', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key' } },
  };
  vm.runInNewContext(source, context, { filename: file });
  return { Page: exports.default, navigations };
}
async function render(page) {
  let result;
  await act(async () => { result = renderDom(React.createElement(page.Page)); });
  return result;
}
const text = r => r.container.textContent;
async function fill(r, label, value) { await act(async () => fireEvent.change(r.getByLabelText(label), { target: { value } })); }
async function submit(r) { await act(async () => fireEvent.submit(r.container.querySelector('form'))); }
async function login(r, email = 'Buyer@Example.test', password = 'dummy-password') {
  await fill(r, 'Email', email); await fill(r, 'Password', password); await submit(r);
}
async function cleanup() { await act(async () => cleanupDom()); }

test('successful login normalizes email, requires a session, and navigates to the protected workspace', async () => {
  let sent;
  const page = loadPage('app/login/page.tsx', { signInWithPassword: async credentials => { sent = credentials; return { data: { session: { access_token: 'test-only' } }, error: null }; } });
  const r = await render(page); await login(r);
  assert.equal(sent.email, 'buyer@example.test'); assert.equal(sent.password, 'dummy-password');
  assert.deepEqual(page.navigations, ['/dashboard']); await cleanup(r);
});
test('invalid credentials stay on login and re-enable submission', async () => {
  const page = loadPage('app/login/page.tsx', { signInWithPassword: async () => ({ data: { session: null }, error: { message: 'Invalid login credentials' } }) });
  const r = await render(page); await login(r);
  assert.match(text(r), /Check your email and password/); assert.deepEqual(page.navigations, []);
  assert.equal(r.container.querySelector('button[type=submit]').disabled, false); await cleanup(r);
});
test('network failure does not leave login stuck or navigate', async () => {
  const page = loadPage('app/login/page.tsx', { signInWithPassword: async () => { throw new Error('network down'); } });
  const r = await render(page); await login(r);
  assert.match(text(r), /Unable to reach/); assert.equal(r.container.querySelector('button[type=submit]').disabled, false);
  assert.deepEqual(page.navigations, []); await cleanup(r);
});
test('an empty successful response cannot navigate as authenticated', async () => {
  const page = loadPage('app/login/page.tsx', { signInWithPassword: async () => ({ data: { session: null }, error: null }) });
  const r = await render(page); await login(r);
  assert.match(text(r), /No sign-in session/); assert.deepEqual(page.navigations, []); await cleanup(r);
});
test('unconfirmed email gets a confirmation instruction', async () => {
  const page = loadPage('app/login/page.tsx', { signInWithPassword: async () => ({ data: { session: null }, error: { message: 'Email not confirmed' } }) });
  const r = await render(page); await login(r); assert.match(text(r), /Confirm your email/); await cleanup(r);
});
test('missing configuration makes no authentication request', async () => {
  const page = loadPage('app/login/page.tsx', { signInWithPassword: () => { throw new Error('must not be called'); } }, { configured: false });
  const r = await render(page); await login(r); assert.match(text(r), /Sign-in is currently unavailable/); assert.deepEqual(page.navigations, []); await cleanup(r);
});
test('reset email uses the recovery redirect and a non-enumerating response', async () => {
  let sent;
  const page = loadPage('app/login/page.tsx', { resetPasswordForEmail: async (...args) => { sent = args; return { error: null }; } });
  const r = await render(page);
  await fill(r, 'Email', 'Buyer@Example.test');
  await act(async () => fireEvent.click(r.getByRole('button', { name: 'Forgot password?' })));
  assert.equal(sent[0], 'buyer@example.test'); assert.equal(sent[1].redirectTo, 'https://example.test/reset-password');
  assert.match(text(r), /If an account exists/); await cleanup(r);
});
test('reset request failure releases the button', async () => {
  const page = loadPage('app/login/page.tsx', { resetPasswordForEmail: async () => { throw new Error('offline'); } });
  const r = await render(page);
  await fill(r, 'Email', 'buyer@example.test');
  await act(async () => fireEvent.click(r.getByRole('button', { name: 'Forgot password?' })));
  assert.match(text(r), /Unable to reach the password reset service/);
  assert.equal(r.getByRole('button', { name: 'Forgot password?' }).disabled, false); await cleanup(r);
});
test('password changes are blocked without a recovery session', async () => {
  let changed = false;
  const page = loadPage('app/reset-password/page.tsx', { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), getSession: async () => ({ data: { session: null }, error: null }), updateUser: async () => { changed = true; } });
  const r = await render(page);
  await submit(r);
  assert.equal(changed, false); assert.equal(r.getByRole('button', { name: 'Update password' }).disabled, true); await cleanup(r);
});
test('password update network failure releases busy state for a valid session', async () => {
  const page = loadPage('app/reset-password/page.tsx', { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), getSession: async () => ({ data: { session: { access_token: 'test-only' } }, error: null }), updateUser: async () => { throw new Error('offline'); } });
  const r = await render(page);
  for (const field of ['New password','Confirm new password']) await fill(r, field, 'dummy-password');
  await submit(r);
  assert.match(text(r), /Unable to reach the password reset service/); assert.equal(r.getByRole('button', { name: 'Update password' }).disabled, false); await cleanup(r);
});
