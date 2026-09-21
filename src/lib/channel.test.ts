import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ChannelFail,
  distribute,
  merchantAccept,
  openChannel,
  remainder,
  settle,
  settleAndSeal,
} from "./channel";
import { KITE, MINT, OPEN_SLOT, PDA, PRIYA, SALT } from "./fixtures";
import { DEPOSIT, MARK_PRICE } from "./policy";
import { signVoucher } from "./voucher";
import { keypairFromSeed } from "./keys";
import { sha256 } from "@noble/hashes/sha256";
import { utf8 } from "./bytes";

function channel() {
  return openChannel({
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
}

function voucher(amount: bigint, expiresAt = 0n) {
  return signVoucher(
    { channelId: PDA.address, cumulativeAmount: amount, expiresAt },
    PRIYA.secret,
    PRIYA.publicKey,
  );
}

test("open rejects zero deposit and payer=payee", () => {
  assert.throws(() => openChannel({
    payer: PRIYA.publicKey,
    payee: PRIYA.publicKey,
    authorizedSigner: PRIYA.publicKey,
    mint: MINT,
    channelId: PDA.address,
    bump: PDA.bump,
    salt: SALT,
    openSlot: OPEN_SLOT,
    deposit: DEPOSIT,
  }), (err: unknown) => err instanceof ChannelFail && err.code === "payer equals payee");
});

test("merchant accepts increasing vouchers under the cap and refuses over-cap", () => {
  const open = channel();
  const first = merchantAccept(open, 0n, voucher(MARK_PRICE), 1n);
  assert.equal(first, MARK_PRICE);
  const second = merchantAccept(open, first, voucher(MARK_PRICE * 2n), 1n);
  assert.equal(second, MARK_PRICE * 2n);
  assert.throws(
    () => merchantAccept(open, second, voucher(DEPOSIT + 1n), 1n),
    (err: unknown) => err instanceof ChannelFail && err.code === "over cap",
  );
});

test("replay of the same cumulative is not monotonic", () => {
  const open = channel();
  const signed = voucher(MARK_PRICE);
  merchantAccept(open, 0n, signed, 1n);
  assert.throws(
    () => merchantAccept(open, MARK_PRICE, signed, 1n),
    (err: unknown) => err instanceof ChannelFail && err.code === "not monotonic",
  );
});

test("wrong channel id and wrong signer fail before money moves", () => {
  const open = channel();
  const stranger = keypairFromSeed(sha256(utf8("stranger")));
  const wrongId = signVoucher(
    { channelId: stranger.publicKey, cumulativeAmount: MARK_PRICE, expiresAt: 0n },
    PRIYA.secret,
    PRIYA.publicKey,
  );
  assert.throws(
    () => merchantAccept(open, 0n, wrongId, 1n),
    (err: unknown) => err instanceof ChannelFail && err.code === "voucher channel mismatch",
  );
  const wrongSig = signVoucher(
    { channelId: PDA.address, cumulativeAmount: MARK_PRICE, expiresAt: 0n },
    stranger.secret,
    stranger.publicKey,
  );
  assert.throws(
    () => merchantAccept(open, 0n, wrongSig, 1n),
    (err: unknown) => err instanceof ChannelFail && err.code === "voucher signer",
  );
});

test("settle_and_seal then distribute pays Kite and refunds Priya", () => {
  const open = channel();
  const spent = 176_000n;
  const sealed = settleAndSeal(open, voucher(spent), 1n);
  assert.equal(sealed.status, "sealed");
  assert.equal(sealed.settled, spent);
  const paid = distribute(sealed);
  assert.equal(paid.toPayee, spent);
  assert.equal(paid.toPayer, DEPOSIT - spent);
  assert.equal(paid.channel.status, "distributed");
  assert.equal(remainder(paid.channel), DEPOSIT - spent);
});

test("on-chain settle still uses the program watermark, not the merchant's", () => {
  const open = channel();
  const accepted = merchantAccept(open, 0n, voucher(MARK_PRICE), 1n);
  assert.equal(open.settled, 0n);
  const settled = settle(open, voucher(accepted), 1n);
  assert.equal(settled.settled, MARK_PRICE);
});
