# Marketing redesign launch checklist

- [ ] Supply public/screens/map-view.png and confirm screenshot dimensions; replace 1600x1000 with the actual ratio if different.
- [ ] Set support email in lib/site.ts after creating the mailbox.
- [ ] Confirm proposed Pro $79 and Team $149 monthly pricing and entitlements.
- [ ] Wire annual Stripe prices before enabling annual checkout (20% discount approved).
- [ ] Confirm cancellation/refund, ownership/export/deletion, and privacy practices.
- [ ] Lawyer review and approval of draft Terms and Privacy.
- [ ] Add real customer proof only with permission and substantiation (TODO; no fabricated proof).
- [ ] Measure Lighthouse on a production build with the final screenshot: Performance >=90, Accessibility >=95.

Dashboard routes, shared global styles, billing endpoints, and signup remain unchanged.

## Validation in this change

- Full repository ESLint passed; focused marketing ESLint passed.
- Production build blocked by pre-existing imports of missing components/mvp/glass-card and lib/mvp/env in login and reset-password. No placeholder implementations were added.
- Public marketing preview rendered after guarding missing Supabase credentials before client construction. Configured session handling is unchanged.
- Production Lighthouse scores are unmeasured because the full build is blocked and the real hero screenshot is missing.
- 1200x630 social sharing PNG added; hero and logo use Next Image with dimensions and responsive sizes. Hero is preloaded (not lazy-loaded) because it is the primary visual; noncritical images use default lazy loading.
