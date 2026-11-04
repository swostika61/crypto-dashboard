// A tiny 7 day price line drawn as plain SVG, no chart library.
// Green when the week ends higher than it started, red when lower.

interface SparklineProps {
  prices: number[];
}

export default function Sparkline({ prices }: SparklineProps) {
  if (prices.length < 2) return null;

  const width = 96;
  const height = 32;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * width;
      const y = height - 2 - ((price - min) / range) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const rising = prices[prices.length - 1] >= prices[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        className={rising ? "stroke-emerald-400" : "stroke-rose-400"}
      />
    </svg>
  );
}
