# Room Stay — repaired front-end package

This package contains targeted repairs to the supplied Room Stay project. It is **not yet safe to launch publicly**: several audit findings require Back4App Cloud Code / Class-Level Permissions and cannot be safely solved by editing browser JavaScript alone.

## Front-end fixes included

- Fixed the homepage crash caused by binding to a missing `#resetFilters`; added the reset button to `index.html`.
- Homepage and property-page startup failures now show a visible connection error instead of silently appearing as an empty site.
- Added the missing listing description textarea, so descriptions can be saved and retained while editing.
- Added safe handling for untrusted image URLs in public, admin and landlord views to prevent injected HTML attributes through image fields.
- Guarded missing agent names so an incomplete agent record no longer crashes the public cards or admin enquiry tabs.
- Reduced homepage agent lookups to one query rather than one query per card, and prevented older asynchronous renders from replacing newer search results.
- Corrected the landlord slot check when editing or switching a listing between managed/unmanaged.
- Added browser-side image upload checks: JPG/PNG/WebP only, maximum 5 MB per image.
- Fixed zero-valued commission/management settings being replaced by defaults.
- Preserved an explicitly saved public price of zero instead of silently substituting a suggested price.
- Removed the non-working admin password-change control and replaced it with an honest instruction.
- Disabled public first-admin self-registration to prevent the first visitor from claiming administrator access.
- Pinned the Parse SDK URL to a specific version.
- Removed the full street address from the public property detail page (the address remains in the stored record and admin/landlord forms).

## Critical items still requiring Back4App/server-side work

These are **not fixed by this front-end patch**. Do not treat the site as secure or payment-ready until these are completed and tested:

1. **Admin authorization:** `isAdmin` is still a client-visible user field. Replace it with a protected Back4App Role and server-side checks. The first admin must be provisioned manually in Back4App by the project owner; do not reopen public self-registration.
2. **Property privacy and approval:** current landlord listing ACLs still allow public reads. That exposes pending/rejected listings and private fields through the Parse API. Implement Cloud Code that exposes only approved public listing fields and uses the master key for admin approval/rejection. Do not merely hide fields in the UI.
3. **Admin listing writes:** landlord-owned ACLs may prevent the admin dashboard from approving/editing/deleting listings. Implement and call secured Cloud Code functions for these actions; direct client saves are not a secure workaround.
4. **Viewing request privacy:** enquiries are private, but the admin/landlord clients query them as ordinary users. Implement authenticated Cloud Code functions with role/owner checks to read and update enquiries. Do not make enquiry records publicly readable because they contain personal information.
5. **Notifications:** no real email/SMS/WhatsApp notification provider is configured. Until one is connected, the site must not promise that someone will call shortly.
6. **Payments and accounting:** R50 subscriptions, free first-room trial, tenant rent collection, deposits, invoices, ledger and landlord payouts are not implemented. The 15% management fee is not a functioning payment flow. Integrate a payment provider and reconcile payment webhooks server-side before advertising or collecting money.
7. **Uploads:** the new checks are client-side only. Add server-side file validation, file size limits, image re-encoding, and orphan-file cleanup. Client validation can be bypassed.
8. **Authentication:** email verification, password reset, lockout/rate limiting and 2FA are not implemented. Separate login and registration flows and configure them in Back4App.
9. **POPIA/legal:** add a privacy notice, consent, data-subject request process and an identified Information Officer. Have a South African lawyer review the Rental Housing Act, Consumer Protection Act and Property Practitioners Act implications, plus the Terms. Existing Terms still contain unverified business promises and should not be relied on as legal advice.
10. **Operations/SEO/accessibility:** automated tests, monitoring, backups, staging, sitemap/robots, per-listing metadata and full keyboard/modal accessibility remain outstanding.

## Back4App setup checklist

1. Back up the existing Back4App app before deploying this project.
2. Deploy the contents of this ZIP to the same static hosting location, preserving the filenames.
3. In Back4App, manually provision the first administrator using the dashboard. Do not create an admin through the public website. Set the required admin flag only as a temporary compatibility measure; a protected Role and Cloud Code authorization are still required.
4. Initialize one `SiteSettings` object with `siteName`, `defaultCommission`, `managementFee`, and `adminClaimed=true`, and restrict its write permissions to the administrator/server.
5. Review Class-Level Permissions for `Property`, `Enquiry`, `Agent`, `SiteSettings`, and `_User`. Do not enable public writes or arbitrary class creation. Do not make enquiries public.
6. Before launch, implement the server-side controls listed above and test with separate public, landlord and admin accounts.

## Important

The public site still uses Parse queries and the current data model. The patch deliberately does not pretend that client-side JavaScript can secure Parse records or implement payments. A proper Cloud Code migration is required to close the critical security and approval-flow findings.
