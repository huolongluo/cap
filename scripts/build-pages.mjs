import { existsSync, renameSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const api = path.join(root, "src/app/api");
const hidden = "/tmp/cap-api-hidden";

if (existsSync(hidden)) rmSync(hidden, { recursive: true, force: true });
if (existsSync(api)) renameSync(api, hidden);
const nextDir = path.join(root, ".next");
if (existsSync(nextDir)) rmSync(nextDir, { recursive: true, force: true });

try {
  const result = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    env: { ...process.env, PAGES: "1" },
    cwd: root,
  });
  if (result.status !== 0) {
    throw new Error(`next build failed: ${result.status}`);
  }
  writeFileSync(path.join(root, "out/.nojekyll"), "");
  for (const name of ["demo.webm", "pitch.webm", "weekly.webm", "demo.mp4", "pitch.mp4", "weekly.mp4", "logo.png"]) {
    const from = name.startsWith("logo") ? path.join(root, "public/logo.png") : path.join(root, "docs", name);
    if (existsSync(from)) copyFileSync(from, path.join(root, "out", name));
  }
} finally {
  if (existsSync(hidden) && !existsSync(api)) renameSync(hidden, api);
}
