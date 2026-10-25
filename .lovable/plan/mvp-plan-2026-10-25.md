# MVP plan

Everything runs in sandbox mode: login, ID checks and payments are simulated. Each one is clearly labeled "Sandbox" so nothing looks like it has really been verified or paid. Maps use free OpenStreetMap tiles, so no API key is needed.

## 1. Brand polish
- The header mark and the installed-app icons use the official metallic logo.

## 2. Sandbox login and onboarding
- Login and Sign up both work in sandbox mode: you enter a name and email, and no password is checked.
- A short onboarding: profile photo, display name, and home location picked on a map.
- Mocked government ID upload: you pick a photo, then see a "Pending → Verified (Sandbox)" status. It shows up under Credentials on Profile.
- There is one account type for everyone. Every user can shop and can open a storefront.

## 3. Storefronts and offers (Create)
- The wizard saves its steps:
  - Storefront: name, category (Cloud Kitchen, Courier, Music Lessons, Crafts, Cab), location on a map
  - Offer: title, price, photo, description
  - Terms: delivery or pickup, schedule
  - Review: publish
- Published offers show up in Discover stories and as map pins, next to the demo listings.
- From Profile you can edit, pause or delete your own offers.

## 4. Chat with commitments and locations
- One-to-one threads that open from any offer ("Message" / "Request").
- In the chat box you can share a location, using either a map picker or a search of free address results.
- Commitment cards cover the item, quantity, price, schedule, and pickup and drop-off points. The other side can Accept, Decline or Counter.
- Live ledger: active, completed and disputed commitments.

## 5. Live tracking (courier, food delivery, cab)
- An accepted delivery-type commitment opens a tracking screen with a map, a route line between pickup and drop-off, a simulated moving courier, the arrival time, and status steps (Accepted → Picked up → On the way → Delivered).
- Confirming delivery completes the commitment.

## 6. Mocked payments and wallet
- Sandbox wallet with a starting balance and a "Top up (Sandbox)" button.
- Accepting a commitment holds the funds in escrow. Delivery releases them to the seller. A dispute freezes them.
- Wallet history lists every hold, release, refund and top-up.

## 7. Trust score from real activity
- Completed commitments, delivery quantities, on-time milestones and distinct counterparties feed into the existing Trust score math.
- Dispute flow: raise, resolve or escalate. The redemption decay is applied automatically.
- Producers with no activity still start from the bureau seed. Demo producers keep their "Illustrative" label.

## 8. MVP finish
- Empty states, error messages, sign out clears all sandbox data, and page titles and descriptions for every screen.
- Full test pass plus a check of every flow on mobile and desktop.

## Technical notes
- Storage: everything is saved in the browser through one typed sandbox store, so it works with no backend. The code is set up so Lovable Cloud can replace that store later.
- Maps: Leaflet with OSM tiles, still lazy-loaded behind ClientOnly. Address search uses Nominatim (free) with a debounce of 1 request per second. Routes use the public OSRM demo, with a straight line as the fallback.
- Payments, the escrow state machine and the "commitment → Trust input" conversion are pure modules with rule tests: hold, release, refund, frozen while disputed, no negative balance, and the input conversion.
- Routes added: /onboarding, /offer/$id, /chat/$id, /track/$id, /wallet.
- Every new item is added to roadmap.md as an open task.
