# xditya.me

Source for my personal site: projects, an about page, a contact form, links, a status page and a small game. Dark theme, with a WebGL ink layer behind most pages.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/)
- CSS modules next to each component, plus shared styles in `src/app/globals.css`. Tailwind v4 is imported there, but only its base reset and the `sr-only` utility are used.
- [GSAP](https://gsap.com/) with ScrollTrigger for scroll-driven motion, [Motion](https://motion.dev/) for component state, [Lenis](https://lenis.darkroom.engineering/) for smooth scrolling
- A WebGL fluid ink layer written for this site (`src/lib/fluid`)
- [three.js](https://threejs.org/) for the game at `/game`
- [matter-js](https://brm.io/matter-js/) for the tech tray on `/about`
- GitHub numbers (repos, stars, followers) fetched on the server and revalidated every hour

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs at http://localhost:3000. `npm run build` is the production build and `npm run lint` runs ESLint.

To try the site on a phone, put an ngrok tunnel in front of the dev server. `next.config.js` allows `*.ngrok-free.app` as a dev origin, so hot reload and hydration work through the tunnel.

## Environment variables

All of them are described in `.env.example`. None are needed to run the site locally.

- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY`: the captcha on the contact form
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`: where contact form messages are delivered
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4; analytics stays off while it is empty
- `GITHUB_TOKEN`: optional, raises the GitHub API rate limit. Without it (or if the fetch fails) the site shows fallback numbers.

## Content

Everything the site says lives in `src/content` (profile, projects, experience, tech stack, socials, links, stats) and is imported from `@/content`. Edit it there; no page repeats a name, link or project.

## Analytics

Google Analytics (GA4) turns on when `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxxxxxxxxxx` is set in `.env.local`.

Tracked interactions include page views, navbar clicks, primary home CTA clicks, social link clicks, and contact form submit outcomes.

## Contact

- [Portfolio Site](https://xditya.me)
- [LinkedIn](https://linkedin.com/in/xditya/)
- [GitHub](https://github.com/xditya)
- [Telegram](https://t.me/xditya)
