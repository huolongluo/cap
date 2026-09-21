export const DEPOSIT = 8_000_000n; // $8.00 USDC, 6 decimals
export const MARK_PRICE = 12_000n; // $0.012 per Hyperliquid mark packet
export const BRIEF_PRICE = 80_000n; // $0.08 overnight brief
export const BOOK_PRICE = 8_000_000n; // $8.00 full L2 book — over-cap after any spend
export const MARK_COUNT = 8;

export const SKUS = {
  "hl.mark": { price: MARK_PRICE, label: "Hyperliquid mid (BTC/ETH/SOL)" },
  "llm.brief": { price: BRIEF_PRICE, label: "Overnight Tokyo-open brief" },
  "hl.book": { price: BOOK_PRICE, label: "Hyperliquid L2 book dump" },
} as const;

export type Sku = keyof typeof SKUS;

export type Actor = "priya" | "scout" | "kite";

export type PolicyDecision = {
  action: "HOLD" | "ALLOW" | "REFUSE";
  reason: string;
};

export function mayOpen(actor: Actor): PolicyDecision {
  if (actor !== "priya") {
    return { action: "HOLD", reason: "Scout cannot open a channel. Priya holds the cap." };
  }
  return { action: "ALLOW", reason: "payer signed open" };
}

export function maySettle(actor: Actor, channelOpen: boolean): PolicyDecision {
  if (!channelOpen) return { action: "HOLD", reason: "no channel. a 402 is not a deposit." };
  if (actor === "scout") {
    return { action: "REFUSE", reason: "Scout can present a voucher. It cannot settle or refund." };
  }
  return { action: "ALLOW", reason: "payer/payee cooperative close" };
}

export function maySpend(channelOpen: boolean, settled: bigint, nextCumulative: bigint, deposit: bigint): PolicyDecision {
  if (!channelOpen) return { action: "HOLD", reason: "no open channel" };
  if (nextCumulative > deposit) return { action: "REFUSE", reason: "voucher exceeds deposit" };
  if (nextCumulative <= settled) return { action: "REFUSE", reason: "cumulative is not strictly greater than settled" };
  return { action: "ALLOW", reason: "within cap" };
}

export function skuPrice(sku: string): bigint | null {
  if (sku in SKUS) return SKUS[sku as Sku].price;
  return null;
}
