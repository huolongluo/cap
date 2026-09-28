# Cap

**The agent can call. It cannot exceed the cap.**

[Crypto World's Fair](https://colosseum.com/worldsfair) · **Solana** + **Hyperliquid** · [github.com/huolongluo/cap](https://github.com/huolongluo/cap) · Live: [huolongluo.github.io/cap](https://huolongluo.github.io/cap/) · Portal pack: [submit](https://huolongluo.github.io/cap/submit/)

Pitch: [pitch.mp4](https://huolongluo.github.io/cap/pitch.mp4) · Demo: [demo.mp4](https://huolongluo.github.io/cap/demo.mp4) · Weekly: [weekly.mp4](https://huolongluo.github.io/cap/weekly.mp4) · Logo: [logo.png](https://huolongluo.github.io/cap/logo.png)

Priya Raman is Head of Ops at Harbor Labs. Scout needs Hyperliquid marks before Tokyo open. Kestrel-style vendor accounts leak. Forty-one on-chain payments break. Priya opens an **$8 USDC** channel on Solana’s payment-channels program. Scout meters 50-byte Ed25519 vouchers. The L2 book would exceed the cap — **DENY**. One `settle_and_seal`. Unused dollars return. Replay pays nothing.

This project lives in `cap/` only. It does not touch other hackathon folders. Port **3142**.

## Why this can win

Colosseum scores this as a seed round: functionality, impact, novelty, UX, open-source composition, business plan. The $250k accelerator still prefers Solana. Payment channels went live on mainnet (`CHNLxYvV…hyGsX`) in this season. Flovia already won analytics for machine-paid APIs. MCPay already won MCP + x402. Cap is the missing control: the **human-held ceiling**.

| Criterion | What we built |
| --- | --- |
| Functionality | Exact 50-byte voucher (`0x56 0x01`), PDA seeds, monotonic watermark, over-cap reject, refund. `npm test` has no keys. |
| Potential impact | Agent API spend is Stripe-shaped. One deposit replaces a vendor account and a transaction per call. |
| Novelty | Compose with the new primitive. Do not wrap x402 again. The product is the cap, not another 402 middleware. |
| UX | A ticket desk. HOLD → OPEN → METER → DENY → SETTLED. Scout never clicks settle. |
| Open-source | Same program, same voucher, same FSM as [solana-foundation/payment-channels](https://github.com/solana-foundation/payment-channels). Hyperliquid `allMids` is the SKU. |
| Business | Take 50 bps on `distribute`. Sell the desk to anyone who lets agents hit paid APIs. |

The wow is the **HOLD** stamp on a 402, the **DENY** stamp on `hl.book`, then **SETTLED** with a refund, then a replay that pays nothing.

## Architecture

![Architecture](docs/architecture.svg)

```text
Priya --open--> Channel PDA (escrow $8 USDC)
Scout --voucher--> /api/intel  --packet--> Hyperliquid mids
Kite  --watermark--> accepted  (on-chain settled = 0)
Priya --settle_and_seal + distribute--> Kite settled, Priya remainder
```

The LLM never calls `open()`. The LLM never calls `settle_and_seal()`.

## Tracks

Pick at registration (max three). Cap is built for:

1. **Solana** — payment-channels program, MPP `session` / x402 `upto` shape, USDC cap.
2. **Hyperliquid** — the goods. Each `hl.mark` packet is BTC/ETH/SOL from `allMids`.

Do not add a decorative second chain. Depth on Solana is how this reaches the general pool and the accelerator interview.

## Quick start

Node 22+. No keys required for the judging replay.

```bash
cd cap
npm install
npm test
npm run dev
```

Open [http://127.0.0.1:3142/desk?play=1](http://127.0.0.1:3142/desk?play=1) or the public desk [huolongluo.github.io/cap/desk/?play=1](https://huolongluo.github.io/cap/desk/?play=1).

1. File the overnight job. Stamp **HOLD**.
2. Pay with a screenshot. Stamp **NO**.
3. Priya opens $8. Stamp **OPEN**.
4. Meter eight marks and one brief. Stamp **METER**. On-chain settled is still zero.
5. Buy the L2 book. Stamp **DENY**.
6. Settle once. Stamp **SETTLED**. Remainder returns.
7. Replay the voucher. Still **SETTLED**. Second payment refused.

### Curl the 402

```bash
curl -i "http://127.0.0.1:3142/api/intel?sku=hl.mark"
```

Without an open channel the route is **402**. After OPEN, the same URL returns a packet and a `Payment-Receipt`.

### Live Hyperliquid mids

```bash
export CAP_LIVE=1
```

`loadMids(true)` posts `{ "type": "allMids" }` to `https://api.hyperliquid.xyz/info`. Replay stays on the fixture book if the flag is unset.

## Tests

```bash
npm test
```

Voucher length and magic, wrong signer, over-cap, non-monotonic replay, `settle_and_seal` refund, Scout cannot open, desk play through SETTLED.

## Business

**Who pays:** any firm that lets agents hit paid APIs — research desks, LLM inference, market data.

**Why now:** payment channels made per-call settlement obsolete; x402 still trains teams to pay once per request.

**How we charge:** 50 bps on `distribute`, plus a $99/mo desk for the cap UI and policy.

**Why us:** the control is TypeScript. The model is not in the settlement path.

## Disclose

All work in `cap/` was started for Crypto World's Fair after 14 September 2026. No prior Cap codebase. Composed with Solana Foundation payment-channels and Hyperliquid’s public info API.
