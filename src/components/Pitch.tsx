"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const SLIDES = [
  {
    kicker: "Crypto World's Fair",
    title: "The agent can call. It cannot exceed the cap.",
    body: "This is my demo for Crypto World's Fair. Cap. Harbor Labs opens an $8 USDC channel on Solana. Scout buys Hyperliquid marks. Unused dollars return.",
  },
  {
    kicker: "The leak",
    title: "A vendor API key has no ceiling. A chain tx per call stalls.",
    body: "Overnight research is forty-one packets. Prepay leaks. x402 pays once per request. Agents do not make one request.",
  },
  {
    kicker: "The primitive",
    title: "Payment channels escrow a ceiling. Usage is a 50-byte voucher.",
    body: "Solana program CHNLxYvV…hyGsX. Magic 0x56 0x01. cumulative > watermark. One settle_and_seal. Remainder refunds.",
  },
  {
    kicker: "The goods",
    title: "Hyperliquid mids are the SKU. The chain is not a sticker.",
    body: "hl.mark is BTC/ETH/SOL from allMids. The brief is written from those numbers. Scout never calls open or settle.",
  },
  {
    kicker: "The business",
    title: "50 bps on distribute. $99 desk for anyone who lets models spend.",
    body: "Beachhead: crypto research desks. Distribution: sit in front of pay-kit. The control is TypeScript, not a prompt.",
  },
  {
    kicker: "The ask",
    title: "Solana track. General awards. Accelerator interview.",
    body: "HOLD, then DENY, then SETTLED, then a replay that pays nothing. That is the product.",
  },
];

export function Pitch() {
  const params = useSearchParams();
  const autoplay = params.get("play") === "1";
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setI((n) => (n + 1) % SLIDES.length);
    }, 16000);
    return () => clearInterval(id);
  }, [autoplay]);

  const slide = SLIDES[i];

  return (
    <main className="wrap" style={{ padding: "2.2rem 0 4rem" }}>
      <p className="kicker">{slide.kicker}</p>
      <h1 style={{ maxWidth: "18ch" }}>{slide.title}</h1>
      <p className="lede">{slide.body}</p>
      <div className="row">
        {SLIDES.map((s, n) => (
          <button
            key={s.kicker}
            className={n === i ? "btn gold" : "btn ghost"}
            onClick={() => setI(n)}
            type="button"
          >
            {n + 1}
          </button>
        ))}
        <Link className="btn sea" href="/desk?play=1">
          Run the desk
        </Link>
      </div>
    </main>
  );
}
