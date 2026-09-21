import { encodeAddress } from "./keys";
import { type Channel } from "./channel";
import { SKUS, type Sku } from "./policy";
import type { MidBook } from "./market";

export type Phase = "idle" | "holding" | "refused" | "open" | "metered" | "denied" | "settled";

export type Beat = { id: string; kind: string; title: string; detail: string };

export type Packet = {
  sku: Sku;
  price: string;
  body: string;
  cumulative: string;
};

export type Opinion = {
  actor: string;
  action: string;
  reason: string;
  narrative: string;
};

export type FileState = {
  id: string;
  phase: Phase;
  live: boolean;
  deposit: string;
  settled: string;
  refund: string;
  paid: string;
  channelId: string;
  payer: string;
  payee: string;
  program: string;
  packets: Packet[];
  beats: Beat[];
  opinion: Opinion | null;
  mids: MidBook | null;
  error: string | null;
};

export type Engine = {
  id: string;
  phase: Phase;
  live: boolean;
  channel: Channel | null;
  lastSigned: import("./voucher").SignedVoucher | null;
  accepted: bigint;
  packets: Packet[];
  beats: Beat[];
  opinion: Opinion | null;
  mids: MidBook | null;
  error: string | null;
  now: bigint;
};

export function publicFile(engine: Engine): FileState {
  const channel = engine.channel;
  const used = !channel
    ? 0n
    : channel.status === "open"
      ? engine.accepted
      : channel.settled;
  const refund = channel ? channel.deposit - used : 0n;
  return {
    id: engine.id,
    phase: engine.phase,
    live: engine.live,
    deposit: channel ? channel.deposit.toString() : "0",
    settled: used.toString(),
    refund: refund.toString(),
    paid: channel ? channel.payoutWatermark.toString() : "0",
    channelId: channel ? encodeAddress(channel.channelId) : "",
    payer: channel ? encodeAddress(channel.payer) : "",
    payee: channel ? encodeAddress(channel.payee) : "",
    program: "CHNLxYvVA28MJP9PrFuDXccuoGXAx7jBacfLEkahyGsX",
    packets: engine.packets,
    beats: engine.beats,
    opinion: engine.opinion,
    mids: engine.mids,
    error: engine.error,
  };
}

export function skuLabel(sku: Sku): string {
  return SKUS[sku].label;
}

let beatSeq = 0;
export function beat(kind: string, title: string, detail: string): Beat {
  beatSeq += 1;
  return { id: `${kind}-${beatSeq}`, kind, title, detail };
}

export function usdc(raw: bigint): string {
  const n = Number(raw) / 1_000_000;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}
