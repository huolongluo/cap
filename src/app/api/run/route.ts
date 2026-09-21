import { json } from "@/lib/json";
import { getFile, liveConfigured, putFile } from "@/lib/store";
import { publicFile } from "@/lib/types";
import { fakePay, meter, newFile, openCap, overCap, replayVoucher, settleDesk } from "@/lib/file";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { action?: string; id?: string };
  const action = body.action || "start";

  if (action === "start") {
    const file = putFile(newFile(liveConfigured()));
    return json(publicFile(file));
  }

  const current = getFile(body.id);
  if (!current) return json({ error: "unknown file" }, 404);

  try {
    let next = current;
    if (action === "fake") next = fakePay(current);
    else if (action === "open") next = openCap(current);
    else if (action === "meter") next = await meter(current);
    else if (action === "over") next = overCap(current);
    else if (action === "settle") next = settleDesk(current);
    else if (action === "replay") next = replayVoucher(current);
    else return json({ error: "unknown action" }, 400);
    putFile(next);
    return json(publicFile(next));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 400);
  }
}
