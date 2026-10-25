<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Trust score math in a pure browser-safe module with concrete rule tests; scoring must not depend on UI state.
- Convert weighted native ratios to percentage points before blending with the bureau seed; the two performance sources must share a scale.
- Raw dispute inputs exclude escalated disputes; add their decayed friction exactly once before the pending penalty to avoid double-counting.
- Render all scored avatars with the shared interactive TrustRing; one breakdown must reflect the same calculation as the displayed ring.
- Keep illustrative Trust histories separate from scoring logic until real transactions are connected; demo records must never imply verification.
- Keep Leaflet imports isolated in a lazy-loaded map rendered behind ClientOnly; browser-only mapping must not enter SSR evaluation.
- Use one filtered producer collection and selected ID for stories, map pins, and offer summaries so discovery stays synchronized.
- Mock login stores only a unified session flag, accepting legacy role flags for compatibility; storefront access must not depend on an account role.
- All sandbox data (user, storefront, offers, chat, commitments, wallet) lives in one typed localStorage store (`src/lib/sandbox-store.ts`) so a Cloud backend can replace it in one place.
- Commitment transitions and escrow effects are pure (`commitments.ts`, `escrow.ts`) and applied together atomically by the store; never mutate wallet or status separately.
- Personal Trust inputs derive only from commitment history via `activity-trust.ts`; no activity means the bureau seed alone.
- Every non-discovery map uses the shared lazy `LazyMap`; OSM tiles, Nominatim search throttled to 1 req/s, OSRM routes with straight-line fallback.
