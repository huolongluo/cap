import { ExtendedPoint, etc, getPublicKey, sign as edSign, verify as edVerify } from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { sha256 } from "@noble/hashes/sha256";
import { base58 } from "@scure/base";
import { concat, utf8 } from "./bytes";

etc.sha512Sync = (...messages: Uint8Array[]) => sha512(concat(...messages));

export const PROGRAM_ID = "CHNLxYvVA28MJP9PrFuDXccuoGXAx7jBacfLEkahyGsX";
export const PROGRAM_ID_BYTES = base58.decode(PROGRAM_ID);
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export function encodeAddress(bytes: Uint8Array): string {
  if (bytes.length !== 32) throw new Error("address must be 32 bytes");
  return base58.encode(bytes);
}

export function decodeAddress(text: string): Uint8Array {
  const bytes = base58.decode(text);
  if (bytes.length !== 32) throw new Error("address must be 32 bytes");
  return bytes;
}

function isOnCurve(bytes: Uint8Array): boolean {
  try {
    ExtendedPoint.fromBytes(bytes);
    return true;
  } catch {
    return false;
  }
}

export function findProgramAddress(seeds: Uint8Array[]): { address: Uint8Array; bump: number } {
  for (let bump = 255; bump >= 0; bump--) {
    const preimage = concat(...seeds, Uint8Array.of(bump), PROGRAM_ID_BYTES, utf8("ProgramDerivedAddress"));
    const hash = sha256(preimage);
    if (!isOnCurve(hash)) return { address: hash, bump };
  }
  throw new Error("unable to find program address");
}

export function channelPda(input: {
  payer: Uint8Array;
  payee: Uint8Array;
  mint: Uint8Array;
  authorizedSigner: Uint8Array;
  salt: bigint;
  openSlot: bigint;
}): { address: Uint8Array; bump: number; id: string } {
  const salt = new Uint8Array(8);
  const slot = new Uint8Array(8);
  let s = input.salt;
  let o = input.openSlot;
  for (let i = 0; i < 8; i++) {
    salt[i] = Number(s & 0xffn);
    slot[i] = Number(o & 0xffn);
    s >>= 8n;
    o >>= 8n;
  }
  const found = findProgramAddress([
    utf8("channel"),
    input.payer,
    input.payee,
    input.mint,
    input.authorizedSigner,
    salt,
    slot,
  ]);
  return { ...found, id: encodeAddress(found.address) };
}

export type Keypair = { secret: Uint8Array; publicKey: Uint8Array; address: string };

export function keypairFromSeed(seed: Uint8Array): Keypair {
  if (seed.length !== 32) throw new Error("seed must be 32 bytes");
  const publicKey = getPublicKey(seed);
  return { secret: seed, publicKey, address: encodeAddress(publicKey) };
}

export function sign(message: Uint8Array, secret: Uint8Array): Uint8Array {
  return edSign(message, secret);
}

export function verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean {
  if (signature.length !== 64 || publicKey.length !== 32) return false;
  return edVerify(signature, message, publicKey);
}
