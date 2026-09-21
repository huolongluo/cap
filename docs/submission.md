# Crypto World's Fair — Cap submission copy

Use this in the Colosseum portal. English only. One product, one team.

## One-liner

Spending ceilings for AI agents. One Solana deposit, off-chain Hyperliquid packets, one settlement.

## Product name

Cap

## Brief description

Harbor Labs opens an $8 USDC payment channel on Solana. Scout, an overnight agent, buys Hyperliquid mark packets as 50-byte Ed25519 vouchers. It cannot open, settle, or exceed the cap. Unused USDC returns when Priya seals the channel. Replay of the same voucher pays nothing.

## Blockchains / tools

- Solana — payment-channels program `CHNLxYvVA28MJP9PrFuDXccuoGXAx7jBacfLEkahyGsX` (MPP session / x402 upto)
- Hyperliquid — `allMids` as the paid SKU (`hl.mark`)
- USDC mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

Tracks to select (max 3): **Solana**, **Hyperliquid**.

## Pitch video beats (2–3 min)

1. Opening line: “This is my demo for Crypto World’s Fair. Cap. The agent can call. It cannot exceed the cap.”
2. Problem: agents either get a vendor API key with no ceiling, or they pay on-chain per call and stall.
3. Insight: Solana payment channels escrow a ceiling. Usage is a voucher. Settlement is one transaction.
4. Demo: `/desk?play=1` — HOLD, NO, OPEN, METER, DENY, SETTLED, replay.
5. Market: every company that lets models spend. 50 bps on distribute. $99 desk.
6. Ask: Solana track + general awards. We want the accelerator interview.

## Demo video beats (≤ 3 min, technical)

Keep this a run, not a second pitch.

1. `npm test`
2. `curl -i /api/intel?sku=hl.mark` → 402
3. Open $8, curl again → packet + Payment-Receipt
4. Show 50-byte voucher hex: magic 56 01
5. `hl.book` → over cap
6. settle_and_seal numbers: Kite paid, Priya refunded
7. Replay refused

## Go-to-market

- Beachhead: crypto research desks already paying for marks and LLM briefs.
- Distribution: compose with pay-kit / pay.sh so any 402 route can sit behind a Cap desk.
- Proof: public replay at `/desk?play=1`, open GitHub, weekly 1-minute update videos.

## Prior development disclosure

None. Cap was started in `hackathon/cap` for this competition. We compose with the Foundation program and Hyperliquid’s public info API; that is other people’s open source, not prior Cap work.

## Links to keep public

- Repo: [github.com/huolongluo/cap](https://github.com/huolongluo/cap) (public)
- Live desk: [huolongluo.github.io/cap/desk/?play=1](https://huolongluo.github.io/cap/desk/?play=1)
- Pitch: [huolongluo.github.io/cap/pitch/?play=1](https://huolongluo.github.io/cap/pitch/?play=1)
- Opening page: `/open`
- Logo: `/logo.png`
- Videos: `docs/pitch.webm`, `docs/demo.webm`, `docs/weekly.webm`

## Weekly update (optional, do it)

One minute: what shipped, what broke, next watermark. They watch these.
