import assert from "node:assert/strict";
import { test } from "node:test";
import { DEPOSIT, mayOpen, maySettle, maySpend, skuPrice } from "./policy";

test("Scout cannot open or settle the cap", () => {
  assert.equal(mayOpen("scout").action, "HOLD");
  assert.equal(mayOpen("priya").action, "ALLOW");
  assert.equal(maySettle("scout", true).action, "REFUSE");
  assert.equal(maySettle("priya", false).action, "HOLD");
  assert.equal(maySettle("priya", true).action, "ALLOW");
});

test("spend policy refuses empty channel, over-cap, and non-monotonic vouchers", () => {
  assert.equal(maySpend(false, 0n, 12_000n, DEPOSIT).action, "HOLD");
  assert.equal(maySpend(true, 0n, DEPOSIT + 1n, DEPOSIT).action, "REFUSE");
  assert.equal(maySpend(true, 12_000n, 12_000n, DEPOSIT).action, "REFUSE");
  assert.equal(maySpend(true, 12_000n, 24_000n, DEPOSIT).action, "ALLOW");
});

test("known SKUs have prices; unknown SKUs do not", () => {
  assert.equal(skuPrice("hl.mark"), 12_000n);
  assert.equal(skuPrice("llm.brief"), 80_000n);
  assert.equal(skuPrice("hl.book"), 8_000_000n);
  assert.equal(skuPrice("free.lunch"), null);
});
