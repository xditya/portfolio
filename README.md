# My Portfolio Site

Welcome to the repository for my personal portfolio website!

This site is built to showcase my projects, skills, and provide a way for visitors to learn more about me and get in touch.

## Features

- **Project Showcase:** Dedicated section to highlight key projects with details.
- **About Me:** Information about my background, skills, and interests.
- **Contact Form:** Easy way for visitors to send me a message.
- **Responsive Design:** Optimized for various devices and screen sizes.

## Technologies Used

- [Next.js](https://nextjs.org/) (React Framework)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) (for animations)

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The dev server runs at http://localhost:3000. Fill in `.env.local` as needed: the contact form needs the hCaptcha and Telegram values, and analytics stays off while the measurement id is empty. Each variable is described in `.env.example`.

## Analytics Setup

Google Analytics (GA4) is integrated through an environment variable. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxxxxxxxxxx` in `.env.local` to turn it on.

Tracked interactions include page views, navbar clicks, primary home CTA clicks, social link clicks, and contact form submit outcomes.

## Contact

If you have any questions or just want to connect, feel free to reach out:

- [Portfolio Site](https://xditya.me)
- [LinkedIn](https://linkedin.com/in/xditya/)
- [GitHub](https://github.com/xditya)
- [Telegram](https://t.me/xditya)

Thank you for checking out my portfolio!
