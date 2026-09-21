export type MidBook = {
  BTC: string;
  ETH: string;
  SOL: string;
  source: "fixture" | "hyperliquid";
  at: string;
};

export const FIXTURE_MIDS: MidBook = {
  BTC: "108412.5",
  ETH: "4126.8",
  SOL: "221.44",
  source: "fixture",
  at: "2026-09-21T01:00:00.000Z",
};

export function briefFromMids(book: MidBook): string {
  const btc = Number(book.BTC);
  const eth = Number(book.ETH);
  const sol = Number(book.SOL);
  const ratio = (sol / btc) * 1_000_000;
  return [
    "Kite overnight brief · Tokyo open",
    `BTC ${book.BTC} · ETH ${book.ETH} · SOL ${book.SOL}`,
    `SOL/BTC ${ratio.toFixed(2)} bps of a coin.`,
    Number.isFinite(eth / btc)
      ? `ETH is ${(eth / btc).toFixed(4)} BTC. Scout may quote; it may not lift the cap.`
      : "Marks unreadable.",
    `Source ${book.source} @ ${book.at}`,
  ].join(" ");
}

export async function loadMids(live: boolean): Promise<MidBook> {
  if (!live) return FIXTURE_MIDS;
  const url = process.env.HYPERLIQUID_INFO_URL || "https://api.hyperliquid.xyz/info";
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "allMids" }),
  });
  if (!res.ok) throw new Error(`hyperliquid ${res.status}`);
  const body = (await res.json()) as Record<string, string>;
  if (!body.BTC || !body.ETH || !body.SOL) throw new Error("hyperliquid missing BTC/ETH/SOL");
  return { BTC: body.BTC, ETH: body.ETH, SOL: body.SOL, source: "hyperliquid", at: new Date().toISOString() };
}
