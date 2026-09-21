import { equal } from "./bytes";
import { verifySignedVoucher, type SignedVoucher } from "./voucher";

export const PROGRAM = "CHNLxYvVA28MJP9PrFuDXccuoGXAx7jBacfLEkahyGsX";

export type ChannelStatus = "nonexistent" | "open" | "sealed" | "closing" | "distributed";

export type Channel = {
  status: Exclude<ChannelStatus, "nonexistent">;
  bump: number;
  salt: bigint;
  deposit: bigint;
  settled: bigint;
  payoutWatermark: bigint;
  payer: Uint8Array;
  payee: Uint8Array;
  authorizedSigner: Uint8Array;
  mint: Uint8Array;
  channelId: Uint8Array;
  openSlot: bigint;
  gracePeriod: number;
  payerWithdrawnAt: bigint;
};

export type ChannelError =
  | "no channel"
  | "not open"
  | "not sealed"
  | "payer equals payee"
  | "deposit is zero"
  | "grace is zero"
  | "voucher magic"
  | "voucher channel mismatch"
  | "voucher signer"
  | "voucher expired"
  | "voucher not fresh"
  | "over cap"
  | "not monotonic"
  | "already withdrawn";

export class ChannelFail extends Error {
  constructor(readonly code: ChannelError) {
    super(code);
  }
}

export function openChannel(input: {
  payer: Uint8Array;
  payee: Uint8Array;
  authorizedSigner: Uint8Array;
  mint: Uint8Array;
  channelId: Uint8Array;
  bump: number;
  salt: bigint;
  openSlot: bigint;
  deposit: bigint;
  gracePeriod?: number;
}): Channel {
  if (equal(input.payer, input.payee)) throw new ChannelFail("payer equals payee");
  if (input.deposit <= 0n) throw new ChannelFail("deposit is zero");
  const grace = input.gracePeriod ?? 86_400;
  if (grace <= 0) throw new ChannelFail("grace is zero");
  return {
    status: "open",
    bump: input.bump,
    salt: input.salt,
    deposit: input.deposit,
    settled: 0n,
    payoutWatermark: 0n,
    payer: input.payer,
    payee: input.payee,
    authorizedSigner: input.authorizedSigner,
    mint: input.mint,
    channelId: input.channelId,
    openSlot: input.openSlot,
    gracePeriod: grace,
    payerWithdrawnAt: 0n,
  };
}

export function acceptVoucher(channel: Channel, signed: SignedVoucher, now: bigint, watermark = channel.settled): bigint {
  if (channel.status !== "open") throw new ChannelFail("not open");
  if (!equal(signed.voucher.channelId, channel.channelId)) throw new ChannelFail("voucher channel mismatch");
  if (!verifySignedVoucher(signed, channel.authorizedSigner, now)) {
    if (!equal(signed.signer, channel.authorizedSigner)) throw new ChannelFail("voucher signer");
    if (signed.voucher.expiresAt !== 0n && now >= signed.voucher.expiresAt) throw new ChannelFail("voucher expired");
    throw new ChannelFail("voucher not fresh");
  }
  if (signed.voucher.cumulativeAmount > channel.deposit) throw new ChannelFail("over cap");
  if (signed.voucher.cumulativeAmount <= watermark) throw new ChannelFail("not monotonic");
  return signed.voucher.cumulativeAmount;
}

export function merchantAccept(channel: Channel, accepted: bigint, signed: SignedVoucher, now: bigint): bigint {
  return acceptVoucher(channel, signed, now, accepted);
}

export function settle(channel: Channel, signed: SignedVoucher, now: bigint): Channel {
  const next = acceptVoucher(channel, signed, now);
  return { ...channel, settled: next };
}

export function settleAndSeal(channel: Channel, signed: SignedVoucher | null, now: bigint): Channel {
  if (channel.status !== "open" && channel.status !== "closing") throw new ChannelFail("not open");
  let settled = channel.settled;
  if (signed) settled = acceptVoucher({ ...channel, status: "open" }, signed, now);
  return { ...channel, status: "sealed", settled };
}

export function distribute(channel: Channel): { channel: Channel; toPayee: bigint; toPayer: bigint } {
  if (channel.status !== "sealed") throw new ChannelFail("not sealed");
  const toPayee = channel.settled - channel.payoutWatermark;
  const toPayer = channel.payerWithdrawnAt === 0n ? channel.deposit - channel.settled : 0n;
  return {
    channel: {
      ...channel,
      status: "distributed",
      payoutWatermark: channel.settled,
      payerWithdrawnAt: channel.payerWithdrawnAt === 0n ? 1n : channel.payerWithdrawnAt,
    },
    toPayee,
    toPayer,
  };
}

export function remainder(channel: Channel): bigint {
  return channel.deposit - channel.settled;
}
