import { CopyBlock } from "@/components/CopyBlock";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

const LINKS = {
  repo: "https://github.com/huolongluo/cap",
  live: "https://huolongluo.github.io/cap/",
  desk: "https://huolongluo.github.io/cap/desk/?play=1",
  pitch: "https://huolongluo.github.io/cap/pitch.mp4",
  demo: "https://huolongluo.github.io/cap/demo.mp4",
  weekly: "https://huolongluo.github.io/cap/weekly.mp4",
  logo: "https://huolongluo.github.io/cap/logo.png",
};

const NAME = "Cap";
const ONE_LINER =
  "Spending ceilings for AI agents. One Solana deposit, off-chain Hyperliquid packets, one settlement.";
const DESCRIPTION =
  "Harbor Labs opens an $8 USDC payment channel on Solana. Scout, an overnight agent, buys Hyperliquid mark packets as 50-byte Ed25519 vouchers. It cannot open, settle, or exceed the cap. Unused USDC returns when Priya seals the channel. Replay of the same voucher pays nothing.";
const GTM =
  "Beachhead: crypto research desks already paying for marks and LLM briefs. Charge 50 bps on distribute, plus $99/mo for the cap desk. Compose with pay-kit so any 402 route sits behind a human-held ceiling.";
const DISCLOSE = "None. Started for Crypto World's Fair after 14 September 2026.";
const TRACKS = "Solana, Hyperliquid";

export default function SubmitPage() {
  return (
    <main className="wrap" style={{ padding: "2.2rem 0 4rem" }}>
      <p className="kicker">Crypto World's Fair · paste into the portal</p>
      <h1>Submission pack</h1>
      <p className="lede">
        English only. One product. Tracks: Solana and Hyperliquid. Prior development: None. Copy each
        field, then submit at{" "}
        <a href="https://colosseum.com/worldsfair" style={{ textDecoration: "underline" }}>
          colosseum.com/worldsfair
        </a>
        .
      </p>

      <section className="grid" style={{ marginTop: "1.4rem" }}>
        <CopyBlock label="Name" value={NAME} />
        <CopyBlock label="One-liner" value={ONE_LINER} />
        <CopyBlock label="Description" value={DESCRIPTION} />
        <CopyBlock label="Tracks" value={TRACKS} />
        <CopyBlock label="GitHub" value={LINKS.repo} />
        <CopyBlock label="Live demo" value={LINKS.desk} />
        <CopyBlock label="Pitch video" value={LINKS.pitch} />
        <CopyBlock label="Demo video" value={LINKS.demo} />
        <CopyBlock label="Weekly video" value={LINKS.weekly} />
        <CopyBlock label="Logo" value={LINKS.logo} />
        <CopyBlock label="Go-to-market" value={GTM} />
        <CopyBlock label="Prior development" value={DISCLOSE} />
      </section>

      <section className="grid" style={{ marginTop: "1.4rem" }}>
        <article className="card">
          <h3>Pitch · 2:02</h3>
          <video controls src={`${base}/pitch.mp4`} style={{ width: "100%", borderRadius: 12 }} />
        </article>
        <article className="card">
          <h3>Demo · 0:28</h3>
          <video controls src={`${base}/demo.mp4`} style={{ width: "100%", borderRadius: 12 }} />
        </article>
        <article className="card">
          <h3>Weekly · 0:30</h3>
          <video controls src={`${base}/weekly.mp4`} style={{ width: "100%", borderRadius: 12 }} />
        </article>
      </section>
    </main>
  );
}
