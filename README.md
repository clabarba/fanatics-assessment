This code repo is for my assessment with Fanatics team

My goal is to flex my skillset in full stack development

Showcasing my ability in leveraging powerful technologies to build a modern webapps.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

See .env.example for how to configure your local .env file

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Stack is
NextJs 
    - JavaScript
    - CSS/SCSS
    - ShadCn
    - Tailwind 
    - ThreeJs
    - Clerk Auth

## Hosting
Vercel for hosting
    - Vercel is a simple and powerful hosting providor for many frameworks, but especially for NextJs

# Database
Prisma/PlanetScale for MySql DB for API limit functionality

  - Install:
    - `npm i -D prisma`
    - `npx prisma init`
    - You should see config files for prisma at this point
  - Usage:
    - Prisma is the connector for the App to Planetscale
    - We define data models for this integeration inside `schema.prisma`
    - When defining new models OR setting up your local with existing models:
      - use `npx prisma generate` to make those same models available for Node modules
      - then run `npx prisma db push` to push those models to your MySql DB hosted in PlanetScale
    - To view your data for any configured data models:
      - `npx prisma studio`
      - you should see a browser tab load automatically for [http://localhost:5555](http://localhost:5555)
      ## CAUTION - below steps will wipe your database
    - To clear you're entire prisma DB:
      - `npx prisma migrate reset`
      - Then run `npx prisma generate` and finally `npx prisma db push`