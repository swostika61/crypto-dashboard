import type { Coin, CoinDetails, Currency } from "@/lib/types";

// One coin, in full: its stats from the markets endpoint, plus its
// hourly prices for the last 7 days for the chart. Cached for 60
// seconds like the list, the free API has a call limit.

const VALID: Currency[] = ["cad", "usd"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-z0-9-]+$/.test(id)) {
    return Response.json({ error: "Unknown coin." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("currency") ?? "cad";
  const currency: Currency = VALID.includes(requested as Currency)
    ? (requested as Currency)
    : "cad";

  const headers = { accept: "application/json" };
  const cache = { next: { revalidate: 60 } };

  try {
    const [marketsResponse, chartResponse] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${id}`,
        { headers, ...cache },
      ),
      fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=7`,
        { headers, ...cache },
      ),
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
