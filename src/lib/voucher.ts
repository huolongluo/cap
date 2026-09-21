import { concat, equal, i64le, readI64le, readU64le, u64le } from "./bytes";
import { sign, verify } from "./keys";

export const VOUCHER_MAGIC = Uint8Array.of(0x56, 0x01);
export const VOUCHER_BYTES = 50;

export type Voucher = {
  channelId: Uint8Array;
  cumulativeAmount: bigint;
  expiresAt: bigint;
};

export type SignedVoucher = {
  voucher: Voucher;
  signer: Uint8Array;
  signature: Uint8Array;
};

export function encodeVoucher(voucher: Voucher): Uint8Array {
  if (voucher.channelId.length !== 32) throw new Error("channel_id must be 32 bytes");
  return concat(VOUCHER_MAGIC, voucher.channelId, u64le(voucher.cumulativeAmount), i64le(voucher.expiresAt));
}

export function decodeVoucher(bytes: Uint8Array): Voucher {
  if (bytes.length !== VOUCHER_BYTES) throw new Error("voucher must be 50 bytes");
  if (!equal(bytes.subarray(0, 2), VOUCHER_MAGIC)) throw new Error("voucher magic mismatch");
  return {
    channelId: bytes.subarray(2, 34),
    cumulativeAmount: readU64le(bytes, 34),
    expiresAt: readI64le(bytes, 42),
  };
}

export function signVoucher(voucher: Voucher, secret: Uint8Array, signer: Uint8Array): SignedVoucher {
  const message = encodeVoucher(voucher);
  return { voucher, signer, signature: sign(message, secret) };
}

export function verifySignedVoucher(signed: SignedVoucher, authorizedSigner: Uint8Array, now: bigint): boolean {
  if (!equal(signed.signer, authorizedSigner)) return false;
  const message = encodeVoucher(signed.voucher);
  if (!verify(signed.signature, message, signed.signer)) return false;
  if (signed.voucher.expiresAt !== 0n && now >= signed.voucher.expiresAt) return false;
  return true;
}
