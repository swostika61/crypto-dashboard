"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CurrencyToggle from "@/components/CurrencyToggle";
import PriceChart from "@/components/PriceChart";
import {
  formatCompactMoney,
  formatPercent,
  formatPrice,
  formatSupply,
} from "@/lib/format";
import type { CoinDetails, Currency } from "@/lib/types";

const DEFAULT_CURRENCY: Currency = "cad";

export default function CoinDetails({ id }: { id: string }) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [details, setDetails] = useState<CoinDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    try {
      const response = await fetch(getCoinUrl(id, currency));
      if (!response.ok) throw new Error("request failed");
      setDetails((await response.json()) as CoinDetails);
      setError("");
    } catch {
      setError(
        "This coin would not load. The free data source limits calls, wait a moment and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, currency]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const coin = details?.coin;
  const prices = details?.prices ?? [];
  const priceChange = coin?.price_change_percentage_24h ?? 0;
  const priceIsDown = priceChange < 0;
  const stats = coin ? getStats(coin, currency) : [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-400 hover:underline"
          >
            ← All coins
          </Link>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">
            Loading coin...
          </p>
        ) : error || !coin ? (
          <div className="py-16 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={loadDetails}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <header className="mt-6 flex flex-wrap items-center gap-4">
              {/* Coin logo comes from the API, plain img is fine here */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coin.image}
                alt=""
                width={44}
                height={44}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {coin.name}{" "}
                  <span className="text-base font-medium uppercase text-slate-500">
                    {coin.symbol}
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Rank #{coin.market_cap_rank}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-bold">
                  {formatPrice(coin.current_price, currency)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    priceIsDown
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {priceIsDown ? "▼" : "▲"} {formatPercent(priceChange)}{" "}
                  today
                </p>
              </div>
            </header>

            <section className="mt-6 rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">
                Price, last 7 days
              </h2>
              <div className="mt-3">
                <PriceChart prices={prices} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>
                  Low {formatPrice(getLowestPrice(prices), currency)}
                </span>
                <span>
                  High {formatPrice(getHighestPrice(prices), currency)}
                </span>
              </div>
            </section>

            <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-slate-900 p-4 ring-1 ring-slate-800"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-base font-semibold">{stat.value}</p>
                </div>
              ))}
            </section>

            <footer className="py-6 text-center text-xs text-slate-500">
              Data from the free CoinGecko API. Demo dashboard, not financial
              advice.
            </footer>
          </>
        )}
      </div>
    </main>
  );
}

function getCoinUrl(id: string, currency: Currency) {
  return `/api/coin/${id}?currency=${currency}`;
}

function getLowestPrice(prices: [number, number][]) {
  return Math.min(...prices.map(([, price]) => price));
}

function getHighestPrice(prices: [number, number][]) {
  return Math.max(...prices.map(([, price]) => price));
}

function getStats(coin: CoinDetails["coin"], currency: Currency) {
  return [
    {
      label: "Market cap",
      value: formatCompactMoney(coin.market_cap, currency),
    },
    {
      label: "Volume 24h",
      value: formatCompactMoney(coin.total_volume, currency),
    },
    {
      label: "24h high",
      value: formatPrice(coin.high_24h, currency),
    },
    {
      label: "24h low",
      value: formatPrice(coin.low_24h, currency),
    },
    {
      label: "Circulating supply",
      value: `${formatSupply(coin.circulating_supply)} ${coin.symbol.toUpperCase()}`,
    },
    {
      label: "All time high",
      value: `${formatPrice(coin.ath, currency)} (${formatPercent(coin.ath_change_percentage)})`,
    },
  ];
}
