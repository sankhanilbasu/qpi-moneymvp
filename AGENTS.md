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
