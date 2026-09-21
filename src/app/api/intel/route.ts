import { json } from "@/lib/json";
import { getFile } from "@/lib/store";
import { spendSku } from "@/lib/file";
import { skuPrice, type Sku } from "@/lib/policy";
import { putFile } from "@/lib/store";
import { ChannelFail } from "@/lib/channel";
import { publicFile } from "@/lib/types";

export const dynamic = "force-dynamic";

const WWW = 'Payment realm="kite.research", intent="session", max="8000000"';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sku = (url.searchParams.get("sku") || "hl.mark") as Sku;
  const fileId = url.searchParams.get("file") || "cap-4417";
  const file = getFile(fileId);

  if (!skuPrice(sku)) return json({ error: "unknown sku" }, 400);
  if (!file || !file.channel || file.channel.status !== "open") {
    return json(
      {
        error: "payment required",
        sku,
        accepts: [{ scheme: "upto", network: "solana", max: "8000000", asset: "USDC" }],
      },
      402,
      { "WWW-Authenticate": WWW, "x-cap-reason": "no open channel" },
    );
  }

  try {
    const next = await spendSku(file, sku);
    putFile(next);
    const view = publicFile(next);
    const packet = view.packets.at(-1);
    return json(
      {
        sku,
        packet,
        accepted: view.settled,
        remainder: view.refund,
        channel: view.channelId,
      },
      200,
      { "Payment-Receipt": `voucher cumulative=${view.settled}` },
    );
  } catch (err) {
    if (err instanceof ChannelFail && err.code === "over cap") {
      return json({ error: "over cap", sku }, 402, { "WWW-Authenticate": WWW, "x-cap-reason": "over cap" });
    }
    return json({ error: err instanceof Error ? err.message : String(err) }, 400);
  }
}
