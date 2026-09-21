import Link from "next/link";

export default function HomePage() {
  return (
    <main className="wrap" style={{ padding: "2.4rem 0 4rem" }}>
      <p className="kicker">Kite Research · Harbor Labs · Solana payment channels</p>
      <h1>The agent can call. It cannot exceed the cap.</h1>
      <p className="lede">
        Priya opens an $8 USDC channel on Solana’s payment-channels program. Scout, the overnight
        agent, buys Hyperliquid marks as 50-byte Ed25519 vouchers. Forty-one on-chain payments
        would break. One deposit, one settlement, unused dollars return. Scout never calls{" "}
        <span className="mono">open</span> or <span className="mono">settle_and_seal</span>.
      </p>
      <div className="row">
        <Link className="btn gold" href="/desk?play=1">
          Run the desk
        </Link>
        <Link className="btn ghost" href="/how">
          How the cap holds
        </Link>
      </div>
      <section className="grid three">
        <article className="card">
          <h3>HOLD</h3>
          <p className="muted">
            Scout hits <span className="mono">/api/intel</span>. The route answers 402. A challenge
            is not a deposit.
          </p>
        </article>
        <article className="card">
          <h3>METER</h3>
          <p className="muted">
            Priya stamps OPEN. Eight Hyperliquid mids and one Tokyo-open brief move off-chain.
            <span className="mono"> settled</span> on-chain is still zero.
          </p>
        </article>
        <article className="card">
          <h3>DENY</h3>
          <p className="muted">
            The L2 book is $8. The remaining cap is smaller. Replay of the same voucher pays
            nothing. Remainder returns to Priya.
          </p>
        </article>
      </section>
    </main>
  );
}
