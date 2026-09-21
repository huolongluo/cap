import assert from "node:assert/strict";
import { test } from "node:test";
import { VOUCHER_BYTES, decodeVoucher, encodeVoucher, signVoucher, verifySignedVoucher } from "./voucher";
import { PRIYA, PDA } from "./fixtures";

test("voucher wire format is exactly 50 bytes with V01 magic", () => {
  const encoded = encodeVoucher({
    channelId: PDA.address,
    cumulativeAmount: 176_000n,
    expiresAt: 0n,
  });
  assert.equal(encoded.length, VOUCHER_BYTES);
  assert.equal(encoded[0], 0x56);
  assert.equal(encoded[1], 0x01);
  const round = decodeVoucher(encoded);
  assert.equal(round.cumulativeAmount, 176_000n);
  assert.equal(round.expiresAt, 0n);
});

test("Priya's Ed25519 signature verifies and a stranger's does not", () => {
  const signed = signVoucher(
    { channelId: PDA.address, cumulativeAmount: 12_000n, expiresAt: 0n },
    PRIYA.secret,
    PRIYA.publicKey,
  );
  assert.equal(verifySignedVoucher(signed, PRIYA.publicKey, 1n), true);
  signed.signature[0] ^= 1;
  assert.equal(verifySignedVoucher(signed, PRIYA.publicKey, 1n), false);
});

test("expired voucher is not fresh", () => {
  const signed = signVoucher(
    { channelId: PDA.address, cumulativeAmount: 12_000n, expiresAt: 50n },
    PRIYA.secret,
    PRIYA.publicKey,
  );
  assert.equal(verifySignedVoucher(signed, PRIYA.publicKey, 50n), false);
  assert.equal(verifySignedVoucher(signed, PRIYA.publicKey, 49n), true);
});
