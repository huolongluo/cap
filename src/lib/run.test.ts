import assert from "node:assert/strict";
import { test } from "node:test";
import { applyAction } from "./run";

test("applyAction runs the desk play without a server", async () => {
  const start = await applyAction(null, "start");
  assert.equal(start.view.phase, "holding");
  const open = await applyAction(start.engine, "open");
  assert.equal(open.view.phase, "open");
  const metered = await applyAction(open.engine, "meter");
  assert.equal(metered.view.phase, "metered");
  const settled = await applyAction(metered.engine, "settle");
  assert.equal(settled.view.phase, "settled");
});
