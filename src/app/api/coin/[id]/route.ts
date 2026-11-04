import type { Coin, CoinDetails, Currency } from "@/lib/types";

const DEFAULT_CURRENCY: Currency = "cad";
const COINGECKO_URL = "https://api.coingecko.com/api/v3/coins";
const COINGECKO_OPTIONS = {
  headers: { accept: "application/json" },
  next: { revalidate: 60 },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidCoinId(id)) {
    return Response.json({ error: "Unknown coin." }, { status: 400 });
  }

  const currency = getCurrency(request);

  try {
    const [marketsResponse, chartResponse] = await Promise.all([
      fetch(buildMarketsUrl(id, currency), COINGECKO_OPTIONS),
      fetch(buildChartUrl(id, currency), COINGECKO_OPTIONS),
    ]);

    if (!marketsResponse.ok || !chartResponse.ok) {
      return Response.json(
        { error: "The price source did not answer. Try again in a minute." },
        { status: 502 },
      );
    }

    const markets = (await marketsResponse.json()) as Coin[];
    const chart = (await chartResponse.json()) as {
      prices: [number, number][];
    };

    if (!markets[0]) {
      return Response.json({ error: "Unknown coin." }, { status: 404 });
    }

    const details: CoinDetails = { coin: markets[0], prices: chart.prices };
    return Response.json(details);
  } catch {
    return Response.json(
      { error: "Could not reach the price source." },
      { status: 502 },
    );
  }
}

function isValidCoinId(id: string) {
  return /^[a-z0-9-]+$/.test(id);
}

function getCurrency(request: Request): Currency {
  const requestedCurrency = new URL(request.url).searchParams.get("currency");
  return requestedCurrency === "usd" ? "usd" : DEFAULT_CURRENCY;
}

function buildMarketsUrl(id: string, currency: Currency) {
  const url = new URL(`${COINGECKO_URL}/markets`);
  url.searchParams.set("vs_currency", currency);
  url.searchParams.set("ids", id);
  return url;
}

function buildChartUrl(id: string, currency: Currency) {
  const url = new URL(`${COINGECKO_URL}/${id}/market_chart`);
  url.searchParams.set("vs_currency", currency);
  url.searchParams.set("days", "7");
  return url;
}
