import { sha256 } from "@noble/hashes/sha256";
import { utf8 } from "./bytes";
import { USDC_MINT, channelPda, decodeAddress, keypairFromSeed, type Keypair } from "./keys";

function seed(label: string): Uint8Array {
  return sha256(utf8(`cap.worldsfair.2026/${label}`));
}

export const PRIYA: Keypair = keypairFromSeed(seed("priya.raman.harbor"));
export const KITE: Keypair = keypairFromSeed(seed("kite.research"));
export const MINT = decodeAddress(USDC_MINT);
export const SALT = 4417n;
export const OPEN_SLOT = 314_200_000n;

export const PDA = channelPda({
  payer: PRIYA.publicKey,
  payee: KITE.publicKey,
  mint: MINT,
  authorizedSigner: PRIYA.publicKey,
  salt: SALT,
  openSlot: OPEN_SLOT,
});
