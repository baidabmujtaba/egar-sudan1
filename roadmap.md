# EGARK browsing redesign
- [x] Match the supplied mobile reference: centered search, illustrated categories, two-card horizontal rows and lightweight bottom navigation.
- [x] Verify the final search, categories, galleries, favorites and navigation on mobile and desktop.
- [x] Shared discovery data and working location/type/budget filters.
- [x] Mobile-first search, categories, horizontal carousels, favorites and bottom navigation.
- [x] Property details/gallery/contact and consistent shared housing/dormitory cards.
- [x] Mobile/desktop public browsing checks and focused filter/favorite tests.
- [ ] Authenticated property details/contact end-to-end check: blocked until the user signs in to the preview; automatic session minting could not match their account.
- Preserve authentication, approvals, payments and administration; unavailable structured property attributes must not be invented.

## Advertiser contact analytics
- [x] Track phone and WhatsApp clicks from existing listing-card dialogs and property details, excluding support links and personal data.
- [x] Register the contact event and verify its schema, behavior tests and public mobile/desktop flows.
- [ ] Verify authenticated contact clicks and live event ingestion: blocked until the user signs in to the preview; automatic session minting cannot match their account, and localhost has no analytics collector.

## Discovery category refinements
- [x] Remove commercial/office filters, replace the general property category with buildings and give every category a colorful illustrative icon.
- [x] Verify category and search filtering, cross-page switching and mobile/desktop presentation; 33 tests passed and real listing searches returned exact matches without runtime errors.

## Account sign-in updates
- [ ] Remove role selection at signup while preserving existing profiles and roles.
- [ ] Enable Google and Apple and add matching buttons to login/signup with safe authenticated return navigation.
- [ ] Test sign-in controls, redirects and mobile/desktop layout; provider completion requires the user's Google/Apple account.