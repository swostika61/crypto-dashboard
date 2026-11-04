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

export default function CoinDetails({ id }: { id: string }) {
  const [currency, setCurrency] = useState<Currency>("cad");
  const [details, setDetails] = useState<CoinDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/coin/${id}?currency=${currency}`);
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
    load();
  }, [load]);

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
        ) : error || !details ? (
          <div className="py-16 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={load}
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
                src={details.coin.image}
                alt=""
                width={44}
                height={44}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {details.coin.name}{" "}
                  <span className="text-base font-medium uppercase text-slate-500">
                    {details.coin.symbol}
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Rank #{details.coin.market_cap_rank}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-bold">
                  {formatPrice(details.coin.current_price, currency)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    details.coin.price_change_percentage_24h < 0
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {details.coin.price_change_percentage_24h < 0 ? "▼" : "▲"}{" "}
                  {formatPercent(details.coin.price_change_percentage_24h)}{" "}
                  today
                </p>
              </div>
            </header>

            <section className="mt-6 rounded-2xl bg-slate-900 p-5 ring-1 ring-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">
                Price, last 7 days
              </h2>
              <div className="mt-3">
                <PriceChart prices={details.prices} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>
                  Low {formatPrice(Math.min(...details.prices.map(([, p]) => p)), currency)}
                </span>
                <span>
                  High {formatPrice(Math.max(...details.prices.map(([, p]) => p)), currency)}
                </span>
              </div>
            </section>

            <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[
                {
                  label: "Market cap",
                  value: formatCompactMoney(details.coin.market_cap, currency),
                },
                {
                  label: "Volume 24h",
                  value: formatCompactMoney(details.coin.total_volume, currency),
                },
                {
                  label: "24h high",
                  value: formatPrice(details.coin.high_24h, currency),
                },
                {
                  label: "24h low",
                  value: formatPrice(details.coin.low_24h, currency),
                },
                {
                  label: "Circulating supply",
                  value: `${formatSupply(details.coin.circulating_supply)} ${details.coin.symbol.toUpperCase()}`,
                },
                {
                  label: "All time high",
                  value: `${formatPrice(details.coin.ath, currency)} (${formatPercent(details.coin.ath_change_percentage)})`,
                },
              ].map((stat) => (
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
