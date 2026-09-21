import {
  ChannelFail,
  distribute,
  merchantAccept,
  openChannel,
  remainder,
  settleAndSeal,
  type Channel,
} from "./channel";
import { PDA, PRIYA, KITE, MINT, OPEN_SLOT, SALT } from "./fixtures";
import { loadMids, briefFromMids } from "./market";
import { BRIEF_PRICE, BOOK_PRICE, DEPOSIT, MARK_COUNT, MARK_PRICE, mayOpen, maySettle, type Sku } from "./policy";
import { beat, publicFile, usdc, type Engine } from "./types";
import { signVoucher, type SignedVoucher } from "./voucher";

function engine(partial: Partial<Engine> & Pick<Engine, "id">): Engine {
  return {
    phase: "idle",
    live: false,
    channel: null,
    lastSigned: null,
    accepted: 0n,
    packets: [],
    beats: [],
    opinion: null,
    mids: null,
    error: null,
    now: 1_779_379_200n,
    ...partial,
  };
}

function speak(actor: string, action: string, reason: string, narrative: string) {
  return { actor, action, reason, narrative };
}

function signNext(channel: Channel, cumulative: bigint, now: bigint): SignedVoucher {
  return signVoucher(
    { channelId: channel.channelId, cumulativeAmount: cumulative, expiresAt: now + 3_600n },
    PRIYA.secret,
    PRIYA.publicKey,
  );
}

export function newFile(live = false): Engine {
  return engine({
    id: "cap-4417",
    phase: "holding",
    live,
    beats: [
      beat(
        "file",
        "Overnight desk filed",
        "Harbor Labs · Scout needs Hyperliquid marks before Tokyo open. No channel. A 402 is not a deposit.",
      ),
    ],
    opinion: speak("Scout", "HOLD", "no channel", "I can request hl.mark. I cannot open Priya's cap."),
  });
}

export function fakePay(state: Engine): Engine {
  return {
    ...state,
    phase: "refused",
    error: "unsigned bytes",
    beats: [
      ...state.beats,
      beat("fake", "Unsigned voucher refused", "Magic, channel_id, and Ed25519 all missing. Kite never saw a 50-byte VoucherArgs."),
    ],
    opinion: speak("Kite", "REFUSE", "voucher not fresh", "A screenshot of a 402 is not an Ed25519 voucher."),
  };
}

export function openCap(state: Engine): Engine {
  const gate = mayOpen("priya");
  if (gate.action !== "ALLOW") throw new Error(gate.reason);
  const channel = openChannel({
    payer: PRIYA.publicKey,
    payee: KITE.publicKey,
    authorizedSigner: PRIYA.publicKey,
    mint: MINT,
    channelId: PDA.address,
    bump: PDA.bump,
    salt: SALT,
    openSlot: OPEN_SLOT,
    deposit: DEPOSIT,
  });
  return {
    ...state,
    phase: "open",
    channel,
    accepted: 0n,
    error: null,
    beats: [
      ...state.beats,
      beat(
        "open",
        `Cap opened · $${usdc(DEPOSIT)} USDC`,
        `payment-channels OPEN · PDA ${PDA.id.slice(0, 8)}… · Scout still cannot settle`,
      ),
    ],
    opinion: speak("Priya", "ALLOW", "payer signed open", "Eight dollars. Scout may meter. I keep settle and refund."),
  };
}

export async function meter(state: Engine): Promise<Engine> {
  if (!state.channel || state.channel.status !== "open") {
    return {
      ...state,
      phase: "holding",
      error: "no open channel",
      beats: [...state.beats, beat("meter", "HOLD", "Scout hit /api/intel. 402. No channel.")],
      opinion: speak("Scout", "HOLD", "no open channel", "The route answered 402. I do not hold the cap."),
    };
  }

  const mids = await loadMids(state.live);
  const packets = [];
  let accepted = state.accepted;
  const beats = [...state.beats];
  let lastSigned: SignedVoucher | null = state.lastSigned;

  for (let i = 0; i < MARK_COUNT; i++) {
    const signed = signNext(state.channel, accepted + MARK_PRICE, state.now);
    accepted = merchantAccept(state.channel, accepted, signed, state.now);
    lastSigned = signed;
    packets.push({
      sku: "hl.mark" as Sku,
      price: MARK_PRICE.toString(),
      body: `BTC ${mids.BTC} · ETH ${mids.ETH} · SOL ${mids.SOL}`,
      cumulative: accepted.toString(),
    });
  }

  {
    const signed = signNext(state.channel, accepted + BRIEF_PRICE, state.now);
    accepted = merchantAccept(state.channel, accepted, signed, state.now);
    lastSigned = signed;
    packets.push({
      sku: "llm.brief" as Sku,
      price: BRIEF_PRICE.toString(),
      body: briefFromMids(mids),
      cumulative: accepted.toString(),
    });
  }

  beats.push(
    beat(
      "meter",
      `${MARK_COUNT} marks + 1 brief · $${usdc(accepted)}`,
      `Off-chain vouchers. On-chain settled is still $0. Remainder if sealed now: $${usdc(state.channel.deposit - accepted)}.`,
    ),
  );

  return {
    ...state,
    phase: "metered",
    lastSigned,
    accepted,
    packets: [...state.packets, ...packets],
    mids,
    beats,
    error: null,
    opinion: speak(
      "Scout",
      "ALLOW",
      "within cap",
      `${packets.length} packets against Priya's $8. I still cannot seal the channel.`,
    ),
  };
}

export async function spendSku(state: Engine, sku: Sku): Promise<Engine> {
  if (!state.channel || state.channel.status !== "open") {
    return {
      ...state,
      phase: "holding",
      error: "no open channel",
      opinion: speak("Scout", "HOLD", "no open channel", "The route answered 402. I do not hold the cap."),
    };
  }
  const price = sku === "hl.mark" ? MARK_PRICE : sku === "llm.brief" ? BRIEF_PRICE : BOOK_PRICE;
  const signed = signNext(state.channel, state.accepted + price, state.now);
  const accepted = merchantAccept(state.channel, state.accepted, signed, state.now);
  const mids = state.mids || (await loadMids(state.live));
  const body =
    sku === "hl.mark"
      ? `BTC ${mids.BTC} · ETH ${mids.ETH} · SOL ${mids.SOL}`
      : sku === "llm.brief"
        ? briefFromMids(mids)
        : "book withheld";
  return {
    ...state,
    phase: "metered",
    accepted,
    lastSigned: signed,
    mids,
    error: null,
    packets: [
      ...state.packets,
      { sku, price: price.toString(), body, cumulative: accepted.toString() },
    ],
    beats: [...state.beats, beat("intel", sku, `cumulative $${usdc(accepted)}`)],
    opinion: speak("Scout", "ALLOW", "within cap", `${sku} delivered. Settled on-chain still waits.`),
  };
}

export function overCap(state: Engine): Engine {
  if (!state.channel || state.channel.status !== "open") throw new Error("no open channel");
  const next = state.accepted + BOOK_PRICE;
  const signed = signNext(state.channel, next, state.now);
  try {
    merchantAccept(state.channel, state.accepted, signed, state.now);
    throw new Error("over-cap voucher was accepted");
  } catch (err) {
    if (!(err instanceof ChannelFail) || err.code !== "over cap") throw err;
  }
  return {
    ...state,
    phase: "denied",
    error: "over cap",
    beats: [
      ...state.beats,
      beat(
        "over",
        "hl.book refused",
        `Cumulative would be $${usdc(next)} against a $${usdc(state.channel.deposit)} deposit. Program rejects before settle.`,
      ),
    ],
    opinion: speak("Kite", "REFUSE", "over cap", "The L2 book is $8. The remaining cap is smaller. No packet."),
  };
}

export function settleDesk(state: Engine): Engine {
  const gate = maySettle("priya", Boolean(state.channel));
  if (gate.action !== "ALLOW") throw new Error(gate.reason);
  if (!state.channel) throw new Error("no channel");
  const sealed = settleAndSeal(state.channel, state.lastSigned, state.now);
  const paid = distribute(sealed);
  return {
    ...state,
    phase: "settled",
    channel: paid.channel,
    error: null,
    beats: [
      ...state.beats,
      beat(
        "settle",
        `Settled once · Kite $${usdc(paid.toPayee)} · refund $${usdc(paid.toPayer)}`,
        "settle_and_seal then distribute. One on-chain close. Unused USDC returns to Priya.",
      ),
    ],
    opinion: speak("Priya", "ALLOW", "cooperative close", "Scout never called settle. The remainder is mine."),
  };
}

export function replayVoucher(state: Engine): Engine {
  if (!state.lastSigned || !state.channel) throw new Error("nothing to replay");
  const watermark = state.channel.status === "open" ? state.accepted : state.channel.settled;
  try {
    merchantAccept(
      { ...state.channel, status: "open" },
      watermark,
      state.lastSigned,
      state.now,
    );
    throw new Error("replay accepted");
  } catch (err) {
    if (err instanceof Error && err.message === "replay accepted") throw err;
    if (!(err instanceof ChannelFail)) throw err;
  }
  return {
    ...state,
    phase: state.phase === "settled" ? "settled" : "denied",
    beats: [
      ...state.beats,
      beat(
        "replay",
        "Replay refused",
        "cumulative_amount is not strictly greater than the watermark. Same 50-byte voucher cannot pay twice.",
      ),
    ],
    opinion: speak("Kite", "REFUSE", "not monotonic", "Watermark already covers this voucher."),
  };
}

export { publicFile };
