import { Suspense } from "react";
import { Desk } from "@/components/Desk";

export default function DeskPage() {
  return (
    <main className="wrap">
      <p className="kicker">Harbor desk · File 4417</p>
      <h1>Overnight Tokyo open</h1>
      <p className="lede">
        Scout may buy Hyperliquid marks against Priya’s channel. It may not open, settle, or
        refund. A 402 is not a deposit. A replay is not a second payment.
      </p>
      <Suspense fallback={<p className="muted">Loading desk…</p>}>
        <Desk />
      </Suspense>
    </main>
  );
}
