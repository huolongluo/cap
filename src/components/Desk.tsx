"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Beat = { id: string; kind: string; title: string; detail: string };
type Packet = { sku: string; price: string; body: string; cumulative: string };
type Opinion = { actor: string; action: string; reason: string; narrative: string };
type FileState = {
  id: string;
  phase: "idle" | "holding" | "refused" | "open" | "metered" | "denied" | "settled";
  live: boolean;
  deposit: string;
  settled: string;
  refund: string;
  paid: string;
  channelId: string;
  packets: Packet[];
  beats: Beat[];
  opinion: Opinion | null;
  error: string | null;
};
type Health = {
  replay: boolean;
  live: boolean;
  program: string;
  channel: string;
  payer: string;
};

function stampClass(phase: FileState["phase"]) {
  if (phase === "holding" || phase === "idle") return "stamp hold";
  if (phase === "open") return "stamp open";
  if (phase === "metered") return "stamp metered";
  if (phase === "settled") return "stamp granted";
  if (phase === "refused" || phase === "denied") return "stamp denied";
  return "stamp";
}

function stampLabel(phase: FileState["phase"]) {
  if (phase === "holding" || phase === "idle") return "HOLD";
  if (phase === "open") return "OPEN";
  if (phase === "metered") return "METER";
  if (phase === "settled") return "SETTLED";
  if (phase === "refused") return "NO";
  if (phase === "denied") return "DENY";
  return "FILE";
}

function usd(raw: string | undefined) {
  const n = Number(raw || "0") / 1_000_000;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
}

export function Desk() {
  const params = useSearchParams();
  const autoplay = params.get("play") === "1";
  const [health, setHealth] = useState<Health | null>(null);
  const [file, setFile] = useState<FileState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  async function call(action: string, id?: string): Promise<FileState> {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "run failed");
    return body as FileState;
  }

  async function act(action: string) {
    setBusy(true);
    setError(null);
    try {
      const next = await call(action, file?.id);
      setFile(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    (async () => {
      try {
        setBusy(true);
        const steps = ["start", "fake", "open", "meter", "over", "settle", "replay"] as const;
        let current: FileState | undefined;
        for (const step of steps) {
          const next = await call(step, current?.id);
          if (!alive) return;
          setFile(next);
          current = next;
          await new Promise((r) => setTimeout(r, 1100));
          if (!alive) return;
        }
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [autoplay]);

  const phase = file?.phase || "idle";
  const used = Number(file?.settled || "0");
  const cap = Number(file?.deposit || "8000000");
  const pct = cap === 0 ? 0 : Math.min(100, (used / cap) * 100);

  return (
    <section className="desk-grid">
      <div className="docket">
        <div className={stampClass(phase)}>{stampLabel(phase)}</div>
        <p className="kicker">File 4417 · Priya × Scout × Kite</p>
        <h2>$8 overnight cap</h2>
        <p className="muted">
          Used ${usd(file?.settled)} · remainder ${usd(file?.refund)} · paid ${usd(file?.paid)}
        </p>
        <div className="meter" aria-label="cap used">
          <span style={{ width: `${pct}%` }} />
        </div>
        {file?.opinion ? (
          <div style={{ marginTop: "1.1rem" }}>
            <p className="mono">
              {file.opinion.actor} · {file.opinion.action}
            </p>
            <p>{file.opinion.narrative}</p>
            <p className="muted">{file.opinion.reason}</p>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: "1.2rem" }}>
            File the overnight job. Scout will request hl.mark. It will not open the channel.
          </p>
        )}
        {file?.packets.length ? (
          <div style={{ marginTop: "0.9rem" }}>
            {file.packets.slice(-4).map((p) => (
              <p className="packet" key={`${p.sku}-${p.cumulative}`}>
                {p.sku} · ${usd(p.price)} · {p.body}
              </p>
            ))}
          </div>
        ) : null}
        <div className="row">
          <button className="btn gold" disabled={busy} onClick={() => act("start")}>
            File overnight
          </button>
          <button className="btn danger" disabled={busy || !file} onClick={() => act("fake")}>
            Pay with screenshot
          </button>
          <button className="btn sea" disabled={busy || !file} onClick={() => act("open")}>
            Priya opens $8
          </button>
          <button className="btn ghost" disabled={busy || !file} onClick={() => act("meter")}>
            Meter marks
          </button>
          <button className="btn danger" disabled={busy || file?.phase === "holding"} onClick={() => act("over")}>
            Buy the book
          </button>
          <button className="btn gold" disabled={busy || !file} onClick={() => act("settle")}>
            Settle once
          </button>
          <button className="btn ghost" disabled={busy || !file} onClick={() => act("replay")}>
            Replay voucher
          </button>
        </div>
        {error ? <p className="err">{error}</p> : null}
        <div className="health">
          <span className="pill">{health?.replay ? "replay" : "live mids"}</span>
          <span className="pill">program {health?.program?.slice(0, 8) || "CHNLxYvV"}…</span>
          {health?.channel ? <span className="pill">PDA {health.channel.slice(0, 8)}…</span> : null}
        </div>
      </div>
      <aside className="card">
        <h3>Tape</h3>
        <ol className="beats">
          {(file?.beats || []).map((b) => (
            <li key={b.id}>
              <strong>{b.title}</strong>
              <span className="muted">{b.detail}</span>
            </li>
          ))}
        </ol>
      </aside>
    </section>
  );
}
