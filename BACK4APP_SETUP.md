# Room Stay — Back4App deployment and authentication

## Important

This project keeps the existing Back4App Application ID and JavaScript key already present in the scripts. They are client credentials. Never add the Back4App Master Key to any HTML or browser JavaScript file. The Master Key is used only by Back4App Cloud Code (`cloud/main.js`).

The public site now calls Cloud Code to retrieve only approved listings and to submit viewing requests. The landlord signup/login flow uses real Parse User accounts and verifies membership of the `Landlord` role. The admin login verifies membership of the `Admin` role. Do not tighten CLPs until Cloud Code has been deployed and tested.

## 1. Back up first

1. Sign in to Back4App and open the existing Room Stay app.
2. Export/backup the database before changing permissions.
3. Keep the existing Application ID and JavaScript key unchanged.
4. Do not delete existing `Property`, `_User`, `Agent`, `Enquiry`, `SiteSettings`, or `_Role` data.

## 2. Deploy Cloud Code

1. In the existing Room Stay app, open **Cloud Code** (the menu label can vary by Back4App dashboard version).
2. Open the Cloud Code project/folder and replace or merge its `main.js` with this package's `cloud/main.js`.
3. Preserve any unrelated Cloud Code functions already in your app; merge them rather than overwriting them blindly.
4. Deploy the Cloud Code to the existing app.
5. Open Cloud Code logs and check that deployment completes without syntax/runtime errors.

Functions included:

- `getApprovedProperties` and `getApprovedProperty`: public read of approved listings only, with landlord price and exact street address withheld.
- `submitViewingRequest`: validates requests and creates a private enquiry.
- `ensureLandlordRole` and `checkUserRole`: server-side role assignment/checking.
- `adminListProperties`, `adminListAgents`, `adminListEnquiries`: admin-only data retrieval.
- `adminSetPropertyStatus`, `adminDeleteProperty`, `adminAssignAgent`, `adminUpdateEnquiry`: admin-only management.
- `beforeSave` triggers: prevent client signup/profile edits from granting admin privileges; force client property submissions/edits to `pending` and enforce owner checks.

## 3. Assign the real administrator

There is deliberately no public first-admin registration screen. Do not re-enable one.

1. Identify the real owner/admin account in the Back4App `_User` collection. If necessary, create the account through the normal Parse signup flow first.
2. In the Back4App Database Browser, open `_Role` and create a Role object named exactly `Admin` (case-sensitive) if it does not exist.
3. Open that role's `users` relation and add only the verified administrator user.
4. Save the role.
5. Sign out of Room Stay and sign in at `admin.html` using that user's email and password.
6. Confirm a normal landlord account is rejected at the admin login.

Do not rely on an `isAdmin` field alone. The dashboard checks actual membership in the `Admin` role through Cloud Code.

## 4. Landlord account migration

1. Deploy Cloud Code first.
2. New landlord registrations call `ensureLandlordRole` after Parse signup.
3. Existing landlord accounts created before this update may not yet be in the `Landlord` role. For each legitimate existing landlord, sign in once and run a controlled migration using a trusted admin process, or have the user create a new landlord account. Do not grant the role to arbitrary accounts.
4. Confirm landlord users can see only their own listings in the portal.

## 5. Class-Level Permissions (CLPs)

Do not change CLPs before Cloud Code is deployed and verified. Then apply least privilege gradually:

- `_User`: do not allow public `find`; do not allow users to change privileged fields. Keep only the signup/login and self-service operations your app actually needs.
- `Property`: disable public `find/get/create/update/delete`. The public site reads through `getApprovedProperties` / `getApprovedProperty`; landlord/admin writes must use secured server functions or explicitly scoped owner permissions. Because this version's landlord form still performs its own owner-scoped save, test the `Property` create/update ACL and CLP combination before disabling those operations.
- `Enquiry`: no public find/get/update/delete. The public form submits through `submitViewingRequest`; administrators read/update through Cloud Code.
- `Agent`: public reads should be limited to the fields needed on live listings; admin writes only.
- `SiteSettings`: public read only if required for the homepage; admin writes only.
- `_Role`: no public role creation or role membership changes.

Parse CLPs and per-object ACLs are both enforced. Test each operation with an anonymous visitor, landlord, and admin account before launch. Do not turn on **Allow Client Class Creation** as a workaround.

## 6. Existing listing visibility

The homepage query previously crashed because the page attached a click handler to a missing `#resetFilters` element. This package adds that element and guards it. It also reads approved listings through Cloud Code so a locked-down Property class can still show approved rooms.

Only records with `status` exactly equal to `approved` are public. Existing listings with missing, `pending`, `rejected`, or differently-cased status values will not appear until reviewed and approved by an administrator.

## 7. Test checklist

- Cloud Code deploys successfully.
- Homepage loads and shows approved listings.
- Pending/rejected listings never appear publicly.
- Property detail page loads only approved rooms.
- Tenant viewing request is saved and cannot be publicly queried.
- Landlord signup creates a Parse `_User` and assigns `Landlord` role.
- Correct landlord login succeeds; wrong password does not trigger signup.
- Landlord cannot access admin pages or another landlord's listings.
- Admin login succeeds only for a member of `Admin` role.
- Admin can approve/reject/delete listings through Cloud Code.
- A landlord cannot approve a listing by changing browser fields or calling Parse directly.

## 8. Limitations still requiring configuration

- Email verification and password reset email templates must be configured in Back4App Authentication settings.
- WhatsApp/SMS/email notifications are not configured in this package.
- Payment gateway, subscription billing, rent collection, deposits, payouts and ledger are not implemented here.
- Existing public-readable ACLs on old records must be reviewed/migrated. Deploying Cloud Code does not retroactively change old ACLs.
- Have a South African professional review POPIA, rental and property-practitioner obligations before collecting rent/deposits or launching paid management services.
