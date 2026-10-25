# Proposed roadmap (Phases 4–9)

Phases 1–3 and the unified welcome screen are complete. Below is a proposed sequence for the rest of the app; each phase can be approved and built on its own.

## Phase 4 — Brand polish
- Replace the small copper header mark with the official metallic logo.
- Update the installed-app icons (home screen, splash) to the new mark.

## Phase 5 — Real accounts (Lovable Cloud)
- Enable Sign up and Login with email and Google; remove the mocked login.
- One account type for everyone: shop by default, open a storefront anytime.
- Profile stores name, photo, and location.

## Phase 6 — Storefronts and offers
- Make the Create wizard save: storefront details, offers (name, price, category, photo), terms.
- Published offers appear on Discover stories and map pins, replacing demo listings.
- Edit and pause your own offers from Profile.

## Phase 7 — Chat and commitments
- Real one-to-one chat between users.
- Propose a commitment from chat (what, quantity, schedule, price); the other side accepts or declines.
- Live ledger shows active, completed, and disputed commitments.

## Phase 8 — Trust score from real activity
- Feed completed commitments, deliveries, and on-time milestones into the existing Trust score math.
- Dispute flow: raise, resolve, escalate; redemption decay applies automatically.
- Remove illustrative histories once real data exists.

## Phase 9 — Wallet and payments
- Wallet balance and transaction history.
- Pay for commitments via a payment provider; payouts to storefront owners.

## Technical notes
- Phases 5–9 need Lovable Cloud (database, auth, storage); Phase 9 adds a payments integration.
- Trust math stays in its pure tested module; new data only supplies its inputs.
- roadmap.md gets these phases as open tasks once approved.
