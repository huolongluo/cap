import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import path from "node:path";

const kind = process.argv[2] || "demo";
const base = process.env.APP_URL || "http://127.0.0.1:3142";
const outDir = path.join(process.cwd(), "docs");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

async function linger(ms) {
  await page.waitForTimeout(ms);
}

if (kind === "pitch") {
  await page.goto(`${base}/open`, { waitUntil: "networkidle" });
  await linger(6000);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await linger(10000);
  await page.goto(`${base}/pitch?play=1`, { waitUntil: "networkidle" });
  await linger(98000);
  await page.goto(`${base}/desk?play=1`, { waitUntil: "networkidle" });
  await page.getByText("SETTLED", { timeout: 25000 });
  await linger(4000);
} else if (kind === "weekly") {
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await linger(8000);
  await page.goto(`${base}/desk?play=1`, { waitUntil: "networkidle" });
  await page.getByText("SETTLED", { timeout: 25000 });
  await linger(20000);
} else {
  await page.goto(`${base}/desk?play=1`, { waitUntil: "networkidle" });
  await page.getByText("SETTLED", { timeout: 25000 });
  await linger(4000);
  await page.goto(`${base}/how`, { waitUntil: "networkidle" });
  await linger(8000);
  await page.evaluate(() => window.scrollTo(0, 700));
  await linger(8000);
}

await context.close();
await browser.close();

const webms = readdirSync(outDir).filter((f) => f.endsWith(".webm") && !f.startsWith("demo") && !f.startsWith("pitch") && !f.startsWith("weekly"));
const webm = webms.sort().at(-1);
if (!webm) throw new Error("no webm recorded");
const dest = path.join(outDir, `${kind}.webm`);
renameSync(path.join(outDir, webm), dest);
console.log("recorded", dest);
