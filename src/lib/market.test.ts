import assert from "node:assert/strict";
import { test } from "node:test";
import { FIXTURE_MIDS, briefFromMids } from "./market";

test("brief is determined by the book, not a prompt", () => {
  const text = briefFromMids(FIXTURE_MIDS);
  assert.match(text, /BTC 108412.5/);
  assert.match(text, /SOL 221.44/);
  assert.match(text, /may not lift the cap/);
});
