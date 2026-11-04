"use client";

import type { Currency } from "@/lib/types";

interface CurrencyToggleProps {
  currency: Currency;
  onChange: (currency: Currency) => void;
}

// CAD first, this dashboard is made for Canada.
const OPTIONS: { value: Currency; label: string }[] = [
  { value: "cad", label: "CAD" },
  { value: "usd", label: "USD" },
];

export default function CurrencyToggle({
  currency,
  onChange,
}: CurrencyToggleProps) {
  return (
    <div className="flex rounded-lg bg-slate-800 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            currency === option.value
              ? "bg-indigo-600 text-white"
              : "text-slate-300 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
