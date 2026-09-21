import { json } from "@/lib/json";
import { PDA, PRIYA, KITE } from "@/lib/fixtures";
import { liveConfigured } from "@/lib/store";
import { PROGRAM } from "@/lib/channel";

export const dynamic = "force-dynamic";

export async function GET() {
  return json({
    replay: !liveConfigured(),
    live: liveConfigured(),
    program: PROGRAM,
    channel: PDA.id,
    payer: PRIYA.address,
    payee: KITE.address,
    cluster: "solana-mainnet-program-replay",
    hyperliquid: process.env.HYPERLIQUID_INFO_URL || "https://api.hyperliquid.xyz/info",
  });
}
