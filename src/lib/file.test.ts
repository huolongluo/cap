import assert from "node:assert/strict";
import { test } from "node:test";
import { BRIEF_PRICE, DEPOSIT, MARK_COUNT, MARK_PRICE } from "./policy";
import { fakePay, meter, newFile, openCap, overCap, publicFile, replayVoucher, settleDesk } from "./file";

test("desk: HOLD, unsigned NO, OPEN, meter, over-cap DENY, settle, replay", async () => {
  let file = newFile();
  assert.equal(file.phase, "holding");
  assert.equal(file.channel, null);

  file = fakePay(file);
  assert.equal(file.phase, "refused");

  file = openCap(file);
  assert.equal(file.phase, "open");
  assert.equal(file.channel?.deposit, DEPOSIT);
  assert.equal(file.channel?.settled, 0n);

  file = await meter(file);
  const spent = MARK_PRICE * BigInt(MARK_COUNT) + BRIEF_PRICE;
  assert.equal(file.phase, "metered");
  assert.equal(file.accepted, spent);
  assert.equal(file.channel?.settled, 0n);
  assert.equal(publicFile(file).settled, spent.toString());
  assert.equal(file.packets.length, MARK_COUNT + 1);
  assert.match(file.packets.at(-1)?.body || "", /Tokyo open/);

  file = overCap(file);
  assert.equal(file.phase, "denied");
  assert.equal(file.accepted, spent);

  file = settleDesk(file);
  assert.equal(file.phase, "settled");
  assert.equal(file.channel?.settled, spent);
  assert.equal(file.channel?.status, "distributed");
  const view = publicFile(file);
  assert.equal(view.refund, (DEPOSIT - spent).toString());

  file = replayVoucher(file);
  assert.equal(file.phase, "settled");
  assert.equal(file.channel?.payoutWatermark, spent);
});

test("Scout cannot meter without a channel", async () => {
  const file = await meter(newFile());
  assert.equal(file.phase, "holding");
  assert.equal(file.error, "no open channel");
});
