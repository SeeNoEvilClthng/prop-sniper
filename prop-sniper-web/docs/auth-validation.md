# Authentication validation

## Implemented and tested

- Login only navigates after Supabase returns a session.
- Email normalization, unconfirmed-email guidance, and generic invalid-credential errors.
- Network exceptions release the busy state. Login and reset buttons cannot submit while a request is pending.
- Reset requests validate the email input, use a same-origin recovery redirect, and show a non-enumerating confirmation.
- Password updates require a session and matching passwords of at least eight characters. Failed updates release busy state.
- Recovery session checks handle provider errors and network failures.
- Ten React DOM tests run with `npm run test:auth`. Supabase responses are mocked; tests do not send email, set a real password, or contact an identity provider.
- Installed @supabase/ssr browser client enables PKCE and detectSessionInUrl. No duplicate code exchange was added.

## Not verified end to end

This checkout has only .env.example, without real Supabase configuration or a test account. The live propsniper.app/login UI differs from the pending PR. Tests do not certify deployed login, session persistence, email delivery, redirect allowlisting, or logout.

The current signup form posts contact details to Stripe trial checkout. It does not call Supabase signUp, collect a password, or create an invitation. The Stripe webhook logs events but does not create users or sync subscription state. New-user onboarding is incomplete and must be connected before presenting checkout as a working account-creation flow.

## Manual release test (use a dedicated test account)

1. Configure the actual Supabase URL and public anon key in the deployment, and rebuild.
2. In Supabase Auth settings, allow the deployment's /reset-password redirect. PKCE email recovery should be completed in the browser that requested it.
3. Sign in with a confirmed existing account. Verify protected workspace access and refresh persistence.
4. Verify an invalid password stays on login, and logout removes access to the protected workspace.
5. Request recovery, open the email link, and choose a new password yourself. Verify the new password works. Agents should not receive passwords in chat.
6. Verify expired/used recovery links and new-user account creation after onboarding is implemented.
