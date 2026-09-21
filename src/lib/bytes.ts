export function concat(...chunks: Uint8Array[]): Uint8Array {
  const size = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export function u64le(value: bigint): Uint8Array {
  if (value < 0n || value > 0xffffffffffffffffn) throw new Error("u64 out of range");
  const out = new Uint8Array(8);
  let n = value;
  for (let i = 0; i < 8; i++) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

export function i64le(value: bigint): Uint8Array {
  return u64le(BigInt.asUintN(64, value));
}

export function readU64le(bytes: Uint8Array, offset: number): bigint {
  let n = 0n;
  for (let i = 7; i >= 0; i--) n = (n << 8n) + BigInt(bytes[offset + i]);
  return n;
}

export function readI64le(bytes: Uint8Array, offset: number): bigint {
  const u = readU64le(bytes, offset);
  return BigInt.asIntN(64, u);
}

export function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function fromHex(text: string): Uint8Array {
  const clean = text.startsWith("0x") ? text.slice(2) : text;
  if (clean.length % 2 !== 0) throw new Error("odd hex");
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function equal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
