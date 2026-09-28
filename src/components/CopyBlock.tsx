"use client";

import { useState } from "react";

export function CopyBlock({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setDone(true);
    window.setTimeout(() => setDone(false), 1400);
  }

  return (
    <article className="card">
      <div className="copy-head">
        <h3>{label}</h3>
        <button type="button" className="btn sea" onClick={copy}>
          {done ? "Copied" : "Copy"}
        </button>
      </div>
      <p className={value.includes("http") || value.length < 80 ? "mono" : "muted"}>{value}</p>
    </article>
  );
}
