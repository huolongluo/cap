import type { Engine } from "./types";

const files = new Map<string, Engine>();

export function putFile(file: Engine): Engine {
  files.set(file.id, file);
  return file;
}

export function getFile(id: string | undefined): Engine | undefined {
  return id ? files.get(id) : undefined;
}

export function liveConfigured(): boolean {
  return process.env.CAP_LIVE === "1";
}
