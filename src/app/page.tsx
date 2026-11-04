"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CurrencyToggle from "@/components/CurrencyToggle";
import Sparkline from "@/components/Sparkline";
import {
  formatCompactMoney,
  formatPercent,
  formatPrice,
} from "@/lib/format";
import type { Coin, Currency } from "@/lib/types";

const REFRESH_SECONDS = 60;
const DEFAULT_CURRENCY: Currency = "cad";

export default function HomePage() {
  const router = useRouter();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staleNote, setStaleNote] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadCoins = useCallback(
    async (selectedCurrency: Currency, isRefresh: boolean) => {
      try {
        const response = await fetch(getCoinsUrl(selectedCurrency));
        if (!response.ok) throw new Error("request failed");
        const data = (await response.json()) as Coin[];
        setCoins(data);
        setLastUpdated(new Date());
        setError("");
        setStaleNote("");
      } catch {
        // A failed refresh keeps the last good data on screen.
        // Only a failed first load is a full error.
        if (isRefresh) {
          setStaleNote("Could not refresh just now, showing the last prices.");
        } else {
          setError(
            "Prices would not load. The free data source limits calls, wait a moment and try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // First load, and again whenever the currency changes.
  useEffect(() => {
    loadCoins(currency, false);
  }, [currency, loadCoins]);

  // Live feeling: refresh on its own every minute.
  useEffect(() => {
    const timer = setInterval(
      () => loadCoins(currency, true),
      REFRESH_SECONDS * 1000,
    );
    return () => clearInterval(timer);
  }, [currency, loadCoins]);

  const visible = filterCoins(coins, search);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Crypto <span className="text-indigo-400">Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Live prices for the top 50 coins, in{" "}
              {currency === "cad" ? "Canadian dollars" : "US dollars"}.
            </p>
          </div>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </header>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search a coin, e.g. bitcoin or BTC"
            className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
          <p className="text-xs text-slate-500">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString("en-CA")} · refreshes every minute`
              : " "}
          </p>
          <button
            type="button"
            onClick={() => loadCoins(currency, true)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Refresh now
          </button>
        </div>

        {staleNote && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            {staleNote}
          </p>
        )}

        <section className="mt-5 overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              Loading live prices...
            </p>
          ) : error ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-rose-300">{error}</p>
              <button
                type="button"
                onClick={() => loadCoins(currency, false)}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              No coins match your search.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Coin</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">24h</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Market cap
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Volume 24h
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Last 7 days
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((coin) => {
                    const down = coin.price_change_percentage_24h < 0;
                    return (
                      <tr
                        key={coin.id}
                        onClick={() => router.push(`/coin/${coin.id}`)}
                        className="cursor-pointer border-b border-slate-800/60 transition last:border-0 hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 text-slate-500">
                          {coin.market_cap_rank}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2.5">
                            {/* Coin logos come from the API, plain img is fine here */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coin.image}
                              alt=""
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="font-medium">{coin.name}</span>
                            <span className="text-xs uppercase text-slate-500">
                              {coin.symbol}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatPrice(coin.current_price, currency)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium ${
                            down ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {down ? "▼" : "▲"}{" "}
                          {formatPercent(coin.price_change_percentage_24h)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          {formatCompactMoney(coin.market_cap, currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          {formatCompactMoney(coin.total_volume, currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex justify-end">
                            <Sparkline
                              prices={coin.sparkline_in_7d?.price ?? []}
                            />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="py-6 text-center text-xs text-slate-500">
          Data from the free CoinGecko API. Click any coin for its chart and
          full numbers. This is a demo dashboard, not financial advice.
        </footer>
      </div>
    </main>
  );
}

function getCoinsUrl(currency: Currency) {
  return `/api/coins?currency=${currency}`;
}

function filterCoins(coins: Coin[], search: string) {
  const searchTerm = search.trim().toLowerCase();
  if (!searchTerm) return coins;

  return coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm) ||
      coin.symbol.toLowerCase().includes(searchTerm),
  );
}
