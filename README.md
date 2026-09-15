# Chalein

One link that answers the only question a trip group chat can never hold:
**who is actually coming, what does it cost each, and who has paid.**

Working name. The product is a web page, deliberately not an app - every
participant arrives from a WhatsApp link and responds without installing or
signing up for anything.

## The loop

1. She fills one short form and gets a link.
2. She pastes it into the group chat.
3. Friends tap in / maybe / out. No account, no download.
4. The per-head cost drops as people confirm, which is the reason to reopen
   the link and the reason to re-share it.

The share message carries live state, so pasting it again says something new
rather than repeating an invite:

```
*Goa in December* - 18-21 Dec 2026
2 in
₹30,000 each
6 days to decide

You in? https://…/t/jcyjau7vu
```

## Running it

```bash
npm install
npx prisma db push
npm run dev
```

Open http://localhost:3000.

## Stack

Next.js 16 (App Router, server actions) · Prisma 6 · SQLite locally ·
Tailwind v4.

Prisma is pinned to 6 on purpose: Prisma 7 removed `url` from the datasource
block and requires driver adapters, which on Windows means a native SQLite
module and build tools. Not worth the setup cost at this stage.

## Deploying

1. In `prisma/schema.prisma`, change the datasource provider to `postgresql`.
2. Point `DATABASE_URL` at Neon or Supabase.
3. Set `NEXT_PUBLIC_BASE_URL` to the real origin - the share message and the
   link preview are both built from it, so a wrong value ships broken links
   into people's group chats.
4. `npx prisma db push`, then deploy to Vercel.

## How identity works

There are no accounts.

- **Participants** get a random `claimToken` on first reply, kept in
  `localStorage`. Returning to the link recognises them and lets them change
  their answer.
- **The organiser** gets a token in her URL once, at creation, stored under a
  separate key. It is the only thing that unlocks marking payments. Her
  participant row reuses that token as its claim token, so the trip page
  passes her identity down directly rather than racing `localStorage`.
- **The trip URL is the capability.** Anyone holding the link can reply, which
  is the point - it has to work for someone who just tapped a forward. Slugs
  are random and unguessable.

## Not built yet, on purpose

- Payments. The advance is tracked, not collected. Taking money means a
  payment gateway and KYC; a UPI deep link (`upi://pay?...`) settles this
  without ever touching funds, and is the obvious next step.
- Monetisation. The loop has to work before it is worth charging for. Travel
  affiliate on a confirmed trip is the intended route.
- Editing a trip after creation, removing a participant, multiple date
  options to vote on.
