function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePagination(query = {}) {
  const page = toInt(query.page, 1);
  const pageSize = toInt(query.pageSize, 20);
  return { page, pageSize };
}

function buildPagination(page, pageSize, total) {
  const safeTotal = Math.max(0, Number(total) || 0);
  const totalPages = Math.max(1, Math.ceil(Math.max(1, safeTotal) / pageSize));
  return {
    page,
    pageSize,
    total: safeTotal,
    totalPages,
  };
}

export { parsePagination, buildPagination };
