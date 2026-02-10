function generateId(prefix, seq = 1, pad = 6) {
  const normalizedPrefix = String(prefix || "ID").toUpperCase();
  const safeSeq = Number.isFinite(Number(seq)) ? Number(seq) : 1;
  const safePad = Number.isFinite(Number(pad)) ? Number(pad) : 6;
  return `${normalizedPrefix}${String(Math.max(1, safeSeq)).padStart(Math.max(1, safePad), "0")}`;
}

function generateMockId(prefix) {
  return generateId(prefix, 1, 6);
}

export { generateId, generateMockId };
