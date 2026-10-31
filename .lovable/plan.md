# Discover: Instagram-style feed with Feed/Map toggle

## What you'll see
- A **Feed / Map toggle** in the top-right of the Discover header. Feed is the default view. Map shows the current map screen, unchanged.
- The **story bubbles** stay at the top in both views.
- The **Feed** is a vertical list of storefront posts, styled like Instagram:
  - Header: the producer's avatar in its Trust ring, name, category, distance, and a "Live" badge (pulsing dot) when the storefront is open.
  - A large square photo of the storefront. You can swipe between the photos of each offer. A small "Live view" overlay shows the number of viewers and "Open now". These numbers are sandbox placeholders, and the overlay says so.
  - Actions: Like (heart) and Message (opens the chat), plus a "View offers" button that goes to the storefront page.
  - Caption: the storefront description, with "more" to expand it. Below it are the offers with prices, like "Seasonal lunch box · £12".
- Your own published storefront appears first and is marked "Your storefront".
- The category chips and search filter both views. Tapping a story bubble in Feed scrolls to that producer's post. In Map, it selects the pin, as it does today.
- Likes are saved on this device, like the rest of the sandbox.

## Technical details
- The view lives in the URL (`/discover?view=feed|map`) via `validateSearch`, so the toggle survives reloads. The toggle goes in AppShell's header through a new optional `actions` slot.
- New `src/components/FeedPost.tsx` renders the shared TrustRing, offer photos (falling back to the producer avatars), and the live badge.
- The feed uses the same filtered producer collection and `selectedId` as the stories, pins and summaries (AGENTS rule). Selecting in feed calls `scrollIntoView` on the post.
- Live status and viewer count come from a deterministic helper in `src/lib/discovery.ts` (seeded by producer id plus the hour), clearly labeled as demo data.
- Likes are added to the sandbox store (`likes: string[]`) with a `toggleLike` action.
- Map stays lazy and client-only. It mounts only in map view.
- Tests: the toggleLike rule, and checks that the feed order puts your own storefront first.
