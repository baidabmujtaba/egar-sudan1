# EGARK browsing redesign
- [x] Match the supplied mobile reference: centered search, illustrated categories, two-card horizontal rows and lightweight bottom navigation.
- [x] Verify the final search, categories, galleries, favorites and navigation on mobile and desktop.
- [x] Shared discovery data and working location/type/budget filters.
- [x] Mobile-first search, categories, horizontal carousels, favorites and bottom navigation.
- [x] Property details/gallery/contact and consistent shared housing/dormitory cards.
- [x] Mobile/desktop public browsing checks and focused filter/favorite tests.
- [x] Authenticated property details/contact end-to-end check verified with a temporary test account.
- Preserve authentication, approvals, payments and administration; unavailable structured property attributes must not be invented.

## Advertiser contact analytics
- [x] Track phone and WhatsApp clicks from existing listing-card dialogs and property details, excluding support links and personal data.
- [x] Register the contact event and verify its schema, behavior tests and public mobile/desktop flows.
- [x] Verify authenticated property contact clicks using a temporary test account and a local tracking stub.
- [ ] Verify live event ingestion: needs a real preview or published-app contact click; localhost has no analytics collector.

## Discovery category refinements
- [x] Remove commercial/office filters, replace the general property category with buildings and give every category a colorful illustrative icon.
- [x] Verify category and search filtering, cross-page switching and mobile/desktop presentation; 33 tests passed and real listing searches returned exact matches without runtime errors.

## Account sign-in updates
- [x] Remove role selection at signup while preserving existing profiles and roles.
- [x] Enable Google and Apple and add matching buttons to login/signup with safe authenticated return navigation.
- [x] Test sign-in controls, authenticated callback return and mobile/desktop layout; 40 focused tests passed.
- [ ] Verify full Google/Apple account authorization: requires the user's provider account; provider settings and the authenticated callback were verified separately.