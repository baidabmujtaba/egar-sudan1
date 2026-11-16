# Architecture rules
- Share approved listing discovery and filtering across browsing pages; this keeps public queries explicit and search consistent without changing approval workflows.
- Store browser favorites as listing identifiers only in device-local storage; no existing server favorites schema is available and private listing data must not be cached there.
- Display structured property attributes only when supplied by the listing schema; missing rooms, bathrooms and amenities must not be inferred from descriptions.
- Scope reference-inspired browsing styles to shared discovery components and page classes; administration, payment forms and approval behavior must retain their existing presentation and logic.
- Emit advertiser-contact analytics directly from existing contact-link handlers through the injected optional Lovable events global; use only categorical properties so contact measurement excludes personal data and support clicks.