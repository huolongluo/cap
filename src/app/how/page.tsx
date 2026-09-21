export default function HowPage() {
  return (
    <main className="wrap" style={{ paddingBottom: "3rem" }}>
      <p className="kicker">Solana payment-channels · CHNLxYvV…hyGsX</p>
      <h1>The cap is the product.</h1>
      <p className="lede">
        x402 charges once per request. Agents do not. Solana Foundation shipped payment channels
        so a ceiling can sit in escrow, usage can move as signed vouchers, and one{" "}
        <span className="mono">settle_and_seal</span> pays what was actually consumed.
      </p>
      <section className="grid" style={{ marginTop: "1.4rem" }}>
        <article className="card">
          <h3>1. Open</h3>
          <p className="muted">
            Priya, and only Priya, calls <span className="mono">open</span>. Seeds are{" "}
            <span className="mono">channel + payer + payee + mint + signer + salt + open_slot</span>.
            The PDA is per-incarnation. Scout has no instruction for this.
          </p>
        </article>
        <article className="card">
          <h3>2. Voucher</h3>
          <p className="muted">
            Exactly 50 bytes: magic <span className="mono">0x56 0x01</span>, 32-byte channel id,
            cumulative u64 LE, expires_at i64 LE. Ed25519 over those bytes. No nonce. Replay is
            <span className="mono"> cumulative &gt; watermark</span>.
          </p>
        </article>
        <article className="card">
          <h3>3. Merchant watermark</h3>
          <p className="muted">
            Kite accepts vouchers off-chain against its own accepted amount. On-chain{" "}
            <span className="mono">settled</span> stays zero until close. That is how 8 marks cost
            one later transaction, not eight.
          </p>
        </article>
        <article className="card">
          <h3>4. The goods</h3>
          <p className="muted">
            Each <span className="mono">hl.mark</span> packet is BTC/ETH/SOL from Hyperliquid{" "}
            <span className="mono">allMids</span>. The brief is written from those numbers. The
            chain is not a sticker on a chatbot.
          </p>
        </article>
        <article className="card">
          <h3>5. Over cap</h3>
          <p className="muted">
            <span className="mono">hl.book</span> is $8. After any spend, cumulative would exceed
            deposit. The program rejects before settle. The LLM does not get a vote.
          </p>
        </article>
        <article className="card">
          <h3>6. Seal and refund</h3>
          <p className="muted">
            <span className="mono">settle_and_seal</span> then <span className="mono">distribute</span>.
            Kite receives settled. Priya receives deposit − settled. The same voucher cannot
            advance the watermark again.
          </p>
        </article>
      </section>
    </main>
  );
}
