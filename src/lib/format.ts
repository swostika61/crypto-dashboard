import type { Currency } from "./types";

// Small helpers so prices and big numbers read the same everywhere.

export function formatPrice(value: number, currency: Currency): string {
  // Small coins need more decimal places to mean anything.
  const digits = value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompactMoney(value: number, currency: Currency): string {
  const symbol = currency === "cad" ? "CA$" : "$";
  const compact = new Intl.NumberFormat("en-CA", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
  return `${symbol}${compact}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSupply(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 0,
  }).format(value);
}
