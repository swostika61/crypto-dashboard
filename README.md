# Crypto Dashboard

A live crypto price dashboard, showing the top 50 coins in Canadian dollars. I worked on financial dashboards before at Share Hub, so I built this to show that side of my skills again: live data from an API, kept fresh on its own, and easy to read at a glance.

**Live demo:** add your Vercel link here after you deploy

## What it does

- Top 50 coins by market cap, with price, 24h change, market cap, 24h volume, and a small 7 day price line for each coin
- Prices in Canadian dollars by default, with a CAD and USD switch
- Search any coin by name or symbol, the list filters as you type
- Prices refresh on their own every minute, and there is a refresh button too. If a refresh fails, the last good prices stay on screen with a small note
- Click any coin to open its own page: a 7 day price chart drawn from hourly data, plus market cap, volume, 24h high and low, circulating supply, and all time high
- Dark theme, green and red for gains and losses, the way finance apps usually look

## Where the data comes from

The prices come from the free CoinGecko API. No account and no API key needed. Wealthsimple, where I keep my own investments, has no public API for prices, so CoinGecko is the right source for a project like this.

The browser never calls CoinGecko directly. It asks this app's own API routes (`src/app/api`), and those routes ask CoinGecko and cache the answer for 60 seconds. The free API limits how many calls you can make, so the caching keeps the app fast and under the limit, even with the auto refresh.

## Tech stack

- Next.js (App Router), with API routes for the data
- TypeScript
- Tailwind CSS
- React state with useState, useEffect and useCallback
- Charts and sparklines drawn as plain SVG, no chart library
- CoinGecko free API for the data

## Run it on your computer

You need Node.js installed. Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Which file does what

- `src/app/page.tsx` — the dashboard: loads the coins, the search, the currency switch, and the auto refresh.
- `src/app/coin/[id]/page.tsx` — the coin page shell, it reads the coin id from the URL.
- `src/components/CoinDetails.tsx` — the coin page itself: big price, the 7 day chart, and the stat cards.
- `src/app/api/coins/route.ts` — the app's own endpoint for the coin list, cached for 60 seconds.
- `src/app/api/coin/[id]/route.ts` — the endpoint for one coin: its stats plus 7 days of hourly prices.
- `src/components/CurrencyToggle.tsx` — the CAD and USD switch, used on both pages.
- `src/components/Sparkline.tsx` — the tiny 7 day line on each row.
- `src/components/PriceChart.tsx` — the big chart on the coin page.
- `src/lib/types.ts` — the TypeScript types for the API data.
- `src/lib/format.ts` — how prices, percents and big numbers are written, so they read the same everywhere.

## Put it on GitHub

1. On github.com, create a new repository named `crypto-dashboard`. Do not add a README there, this project already has one.
2. In this project folder, run:

```bash
git init
git add .
git commit -m "Crypto dashboard with live CAD prices"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/crypto-dashboard.git
git push -u origin main
```

3. Refresh the GitHub page. Your code and this README will be there.

## Deploy it free on Vercel

1. Go to vercel.com and sign in with your GitHub account.
2. Click "Add New Project" and pick the `crypto-dashboard` repository.
3. Leave every setting as it is and click Deploy.
4. When it finishes, Vercel gives you a live link. Paste that link at the top of this README, and add it to your portfolio and LinkedIn.

One note: the free CoinGecko API has call limits, and on a public deployment many visitors share the same limit, so live data can pause at busy times. The app handles that with an error message and a retry button instead of breaking.

## Ideas to add later

- A watchlist: star a coin and it stays at the top, saved in the browser
- More chart ranges: 24 hours, 30 days, 1 year
- Price alerts, a note when a coin moves more than a set percent
- A portfolio page: enter how much of a coin you hold and see the total value

## What I can say about it in an interview

I built this dashboard because my earlier job at Share Hub was financial dashboards, and I wanted a project that shows the same skills. It takes live data from the CoinGecko API, but the browser calls my own Next.js API routes, which cache the answer for a minute, because the free API has a call limit and I did not want the page hammering it. The list refreshes every minute, and if a refresh fails it keeps the last good data instead of going blank. The charts are plain SVG that I draw from the price points myself, no chart library. Prices start in Canadian dollars because that is what matters here, with a switch to USD.
