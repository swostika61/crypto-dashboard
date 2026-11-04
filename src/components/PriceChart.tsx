// The 7 day price chart on the coin page, drawn as plain SVG.
// Same idea as the sparkline, bigger, with a soft filled area.

interface PriceChartProps {
  prices: [number, number][]; // [timestamp, price]
}

export default function PriceChart({ prices }: PriceChartProps) {
  if (prices.length < 2) {
    return <p className="text-sm text-slate-400">No chart data right now.</p>;
  }

  const width = 640;
  const height = 220;
  const values = prices.map(([, price]) => price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pointList = values.map((price, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 8 - ((price - min) / range) * (height - 16);
    return [x, y] as const;
  });

  const line = pointList
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} ${width},${height} 0,${height}`;
  const rising = values[values.length - 1] >= values[0];
  const colorClass = rising ? "text-emerald-400" : "text-rose-400";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${colorClass}`}
      role="img"
      aria-label="Price over the last 7 days"
    >
      <polygon points={area} fill="currentColor" opacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
