import type { Currency } from "@/lib/types";

// The browser asks this route, and this route asks CoinGecko.
// Two reasons: the free CoinGecko API limits how often you can call
// it, so the answer is cached for 60 seconds here, and the page code
// stays clean, it just reads JSON from its own app.

const VALID: Currency[] = ["cad", "usd"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("currency") ?? "cad";
  const currency: Currency = VALID.includes(requested as Currency)
    ? (requested as Currency)
    : "cad";

  const url =
    "https://api.coingecko.com/api/v3/coins/markets" +
    `?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1` +
    "&sparkline=true&price_change_percentage=24h";

  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return Response.json(
        { error: "The price source did not answer. Try again in a minute." },
        { status: 502 },
      );
    }
    const coins = await response.json();
    return Response.json(coins);
  } catch {
    return Response.json(
      { error: "Could not reach the price source." },
      { status: 502 },
    );
  }
}
