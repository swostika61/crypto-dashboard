// The shape of the coin data this app uses, taken from the free
// CoinGecko API response. Only the fields the dashboard shows.

export type Currency = "cad" | "usd";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetails {
  coin: Coin;
  // [timestamp, price] pairs, one point per hour over 7 days.
  prices: [number, number][];
}
