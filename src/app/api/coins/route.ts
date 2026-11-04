import type { Currency } from "@/lib/types";

const DEFAULT_CURRENCY: Currency = "cad";
const COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/markets";

export async function GET(request: Request) {
  const currency = getCurrency(request);
  const url = new URL(COINGECKO_URL);

  url.searchParams.set("vs_currency", currency);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "50");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "true");
  url.searchParams.set("price_change_percentage", "24h");

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

function getCurrency(request: Request): Currency {
  const requestedCurrency = new URL(request.url).searchParams.get("currency");
  return requestedCurrency === "usd" ? "usd" : DEFAULT_CURRENCY;
}
