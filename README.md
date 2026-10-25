# Trust Trail Marketplace

Replicate the QPi.money trust platform as a Progressive Web App (PWA).

Start with Phase 1:
- PWA setup: Web app manifest (name "QPi.money", short name "QPi", standalone display, copper theme color #C46E3A, background #FFFFFF), service worker registration, and installability affordance.
- Design & theme: Copper brand palette (#C46E3A / #B87333), Geist typography, clean iOS-style mobile container, and light/dark theme toggle in the top header.
- Navigation: 4-tab fixed bottom navigation bar formatted for mobile safe areas:
  1. Discover (Home with spatial search)
  2. Chat (Live ledger and conversational smart-contract commitments — replacing "ledger")
  3. Create (Storefront and offer creation wizard)
  4. Profile (User confidence score, wallet preview, and credentials)
- Welcome & Login screen: Centered QPi mark, active Login button with mocked authentication bypassing into the app shell, disabled Sign Up, and role selection (Consumer / Producer).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4acb414f-22fa-4a3f-87ab-789bd0fdf94e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
