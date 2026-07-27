// src/engine/uuid.ts
// Lightweight RFC 4122 v4 UUID generator using Math.random.
// Avoids ESM import issues with the uuid npm package in Metro bundler.

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
