import { fakePay, meter, newFile, openCap, overCap, replayVoucher, settleDesk } from "./file";
import { PDA, PRIYA } from "./fixtures";
import { PROGRAM } from "./channel";
import { publicFile, type Engine, type FileState } from "./types";

export type Action = "start" | "fake" | "open" | "meter" | "over" | "settle" | "replay";

export function healthView() {
  return {
    replay: true,
    live: false,
    program: PROGRAM,
    channel: PDA.id,
    payer: PRIYA.address,
    payee: "",
    cluster: "solana-mainnet-program-replay",
    hyperliquid: "https://api.hyperliquid.xyz/info",
  };
}

export async function applyAction(engine: Engine | null, action: string): Promise<{ engine: Engine; view: FileState }> {
  if (action === "start") {
    const next = newFile(false);
    return { engine: next, view: publicFile(next) };
  }
  if (!engine) throw new Error("unknown file");
  let next = engine;
  if (action === "fake") next = fakePay(engine);
  else if (action === "open") next = openCap(engine);
  else if (action === "meter") next = await meter(engine);
  else if (action === "over") next = overCap(engine);
  else if (action === "settle") next = settleDesk(engine);
  else if (action === "replay") next = replayVoucher(engine);
  else throw new Error("unknown action");
  return { engine: next, view: publicFile(next) };
}
