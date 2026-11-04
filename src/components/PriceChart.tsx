// The 7 day price chart on the coin page, drawn as plain SVG.
// Same idea as the sparkline, bigger, with a soft filled area.

interface PriceChartProps {
  prices: [number, number][]; // [timestamp, price]
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const CHART_PADDING = 8;

export default function PriceChart({ prices }: PriceChartProps) {
  if (prices.length < 2) {
    return <p className="text-sm text-slate-400">No chart data right now.</p>;
  }

  const values = prices.map(([, price]) => price);
  const line = createLine(values);
  const area = `${line} ${CHART_WIDTH},${CHART_HEIGHT} 0,${CHART_HEIGHT}`;
  const rising = values[values.length - 1] >= values[0];
  const colorClass = rising ? "text-emerald-400" : "text-rose-400";

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
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

function createLine(values: number[]) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const priceRange = maximum - minimum || 1;
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;

  return values
    .map((price, index) => {
      const x = (index / (values.length - 1)) * CHART_WIDTH;
      const y =
        CHART_HEIGHT -
        CHART_PADDING -
        ((price - minimum) / priceRange) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
