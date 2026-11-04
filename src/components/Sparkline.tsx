// A tiny 7 day price line drawn as plain SVG, no chart library.
// Green when the week ends higher than it started, red when lower.

interface SparklineProps {
  prices: number[];
}

const SPARKLINE_WIDTH = 96;
const SPARKLINE_HEIGHT = 32;
const SPARKLINE_PADDING = 2;

export default function Sparkline({ prices }: SparklineProps) {
  if (prices.length < 2) return null;

  const points = createPoints(prices);

  const rising = prices[prices.length - 1] >= prices[0];

  return (
    <svg
      width={SPARKLINE_WIDTH}
      height={SPARKLINE_HEIGHT}
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
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

function createPoints(prices: number[]) {
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const priceRange = maximum - minimum || 1;
  const usableHeight = SPARKLINE_HEIGHT - SPARKLINE_PADDING * 2;

  return prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * SPARKLINE_WIDTH;
      const y =
        SPARKLINE_HEIGHT -
        SPARKLINE_PADDING -
        ((price - minimum) / priceRange) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
