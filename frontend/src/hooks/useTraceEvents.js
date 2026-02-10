import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTraceTimeline } from "@/services/api";

const allowedModes = new Set(["global", "filtered"]);
const allowedPageSizes = new Set([10, 20, 50]);
const allowedTypes = new Set(["sku", "epc", "grn", "do", "rma", "put", "asn", "adj", "location", "reference"]);

function normalizeMode(mode) {
  const value = String(mode || "global").toLowerCase();
  return allowedModes.has(value) ? value : "global";
}

function normalizeType(type) {
  const value = String(type || "").toLowerCase();
  return allowedTypes.has(value) ? value : "";
}

function normalizeFilter(filter) {
  if (!filter) {
    return null;
  }

  const type = normalizeType(filter.type);
  const value = String(filter.value || "").trim();
  if (!type || !value) {
    return null;
  }

  return { type, value };
}

function normalizePage(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

function normalizePageSize(value) {
  const parsed = Number(value);
  if (!allowedPageSizes.has(parsed)) {
    return 20;
  }
  return parsed;
}

export function useTraceEvents({ session, initialQuery }) {
  const initialMode = normalizeMode(initialQuery?.mode);
  const initialFilter = normalizeFilter(initialQuery?.filter);
  const initialIsFiltered = initialMode === "filtered" && initialFilter;

  const [mode, setMode] = useState(initialIsFiltered ? "filtered" : "global");
  const [filter, setFilter] = useState(initialIsFiltered ? initialFilter : null);
  const [page, setPage] = useState(normalizePage(initialQuery?.page));
  const [pageSize, setPageSize] = useState(normalizePageSize(initialQuery?.pageSize));

  const [events, setEvents] = useState([]);
  const [context, setContext] = useState(null);
  const [pagination, setPagination] = useState({
    page: normalizePage(initialQuery?.page),
    pageSize: normalizePageSize(initialQuery?.pageSize),
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFiltered = mode === "filtered" && Boolean(filter?.type && filter?.value);

  const requestParams = useMemo(() => {
    const params = {
      mode,
      page,
      pageSize,
    };

    if (isFiltered) {
      params.type = filter.type;
      params.value = filter.value;
    }

    if (session?.warehouse_id) {
      params.warehouse_id = session.warehouse_id;
    }

    return params;
  }, [mode, page, pageSize, isFiltered, filter, session?.warehouse_id]);

  const loadEvents = useCallback(async () => {
    if (!session?.tenant_id) {
      setEvents([]);
      setContext(null);
      setPagination({ page: 1, pageSize, total: 0, totalPages: 1 });
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetchTraceTimeline(session, requestParams);

      setEvents(Array.isArray(response?.data) ? response.data : []);
      setContext(response?.context || null);
      const responsePagination = response?.pagination || {};
      setPagination({
        page: normalizePage(responsePagination.page || page),
        pageSize: normalizePageSize(responsePagination.pageSize || pageSize),
        total: Number(responsePagination.total || 0),
        totalPages: Math.max(1, Number(responsePagination.totalPages || 1)),
      });
    } catch (loadError) {
      setEvents([]);
      setContext(null);
      setPagination({ page: 1, pageSize, total: 0, totalPages: 1 });
      setError(loadError.message || "Failed to load trace timeline");
    } finally {
      setLoading(false);
    }
  }, [session, requestParams, page, pageSize]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const applyFilter = useCallback((nextFilter) => {
    const normalizedFilter = normalizeFilter(nextFilter);
    if (!normalizedFilter) {
      return;
    }

    setMode("filtered");
    setFilter(normalizedFilter);
    setPage(1);
  }, []);

  const clearFilter = useCallback(() => {
    setMode("global");
    setFilter(null);
    setPage(1);
  }, []);

  const updatePage = useCallback((nextPage) => {
    setPage(normalizePage(nextPage));
  }, []);

  const updatePageSize = useCallback((nextPageSize) => {
    const normalized = normalizePageSize(nextPageSize);
    setPageSize(normalized);
    setPage(1);
  }, []);

  const setStateFromQuery = useCallback((queryState) => {
    const nextMode = normalizeMode(queryState?.mode);
    const nextFilter = normalizeFilter(queryState?.filter);
    const nextPage = normalizePage(queryState?.page);
    const nextPageSize = normalizePageSize(queryState?.pageSize);
    const shouldUseFiltered = nextMode === "filtered" && nextFilter;

    setMode((current) => (current === (shouldUseFiltered ? "filtered" : "global") ? current : shouldUseFiltered ? "filtered" : "global"));
    setFilter((current) => {
      const normalizedCurrent = normalizeFilter(current);
      const normalizedNext = shouldUseFiltered ? nextFilter : null;
      if (JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedNext)) {
        return current;
      }
      return normalizedNext;
    });
    setPage((current) => (current === nextPage ? current : nextPage));
    setPageSize((current) => (current === nextPageSize ? current : nextPageSize));
  }, []);

  return {
    mode,
    filter,
    isFiltered,
    page,
    pageSize,
    events,
    context,
    pagination,
    loading,
    error,
    applyFilter,
    clearFilter,
    setPage: updatePage,
    setPageSize: updatePageSize,
    setStateFromQuery,
    reload: loadEvents,
  };
}
