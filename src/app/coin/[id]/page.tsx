import { Suspense } from "react";
import CoinDetails from "@/components/CoinDetails";

// The coin id comes from the URL, like /coin/bitcoin.
// Reading it happens inside the Suspense boundary, and the id is
// handed to the client component that loads and shows the data.
export default function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950">
          <p className="text-sm text-slate-400">Loading coin...</p>
        </main>
      }
    >
      <CoinFromParams params={params} />
    </Suspense>
  );
}

async function CoinFromParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CoinDetails id={id} />;
}
