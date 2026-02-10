import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TraceContextCard } from "@/components/trace/TraceContextCard";
import { TraceTimelineCard } from "@/components/trace/TraceTimelineCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTraceEvents } from "@/hooks/useTraceEvents";
import { toSessionContext } from "@/services/api";

const defaultPageSize = 20;
const pageSizeOptions = new Set([10, 20, 50]);
const allowedTypes = new Set(["sku", "epc", "grn", "do", "rma", "put", "asn", "adj", "location", "reference"]);

const filterTypeLabels = {
  sku: "SKU",
  epc: "EPC",
  grn: "GRN",
  do: "DO",
  rma: "RMA",
  put: "PUT",
  asn: "ASN",
  adj: "ADJ",
  location: "Location",
  reference: "Reference",
};

function sanitizePage(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

function sanitizePageSize(value) {
  const parsed = Number(value);
  if (!pageSizeOptions.has(parsed)) {
    return defaultPageSize;
  }
  return parsed;
}

function parseQueryState(searchParams) {
  const mode = String(searchParams.get("mode") || "global").toLowerCase() === "filtered" ? "filtered" : "global";
  const type = String(searchParams.get("type") || "").toLowerCase();
  const value = String(searchParams.get("value") || "").trim();
  const page = sanitizePage(searchParams.get("page") || 1);
  const pageSize = sanitizePageSize(searchParams.get("pageSize") || defaultPageSize);

  if (mode === "filtered" && allowedTypes.has(type) && value) {
    return {
      mode: "filtered",
      filter: { type, value },
      page,
      pageSize,
    };
  }

  return {
    mode: "global",
    filter: null,
    page,
    pageSize,
  };
}

function buildQueryString({ mode, filter, page, pageSize }) {
  const params = new URLSearchParams();

  if (mode === "filtered" && filter?.type && filter?.value) {
    params.set("mode", "filtered");
    params.set("type", filter.type);
    params.set("value", filter.value);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  if (pageSize !== defaultPageSize) {
    params.set("pageSize", String(pageSize));
  }

  return params.toString();
}

function inferFilterFromInput(rawInput) {
  const trimmed = String(rawInput || "").trim();
  if (!trimmed) {
    return null;
  }

  const upper = trimmed.toUpperCase();
  if (upper.startsWith("SKU")) return { type: "sku", value: trimmed };
  if (upper.startsWith("EPC")) return { type: "epc", value: trimmed };
  if (upper.startsWith("GRN")) return { type: "grn", value: trimmed };
  if (upper.startsWith("DO")) return { type: "do", value: trimmed };
  if (upper.startsWith("RMA")) return { type: "rma", value: trimmed };
  if (upper.startsWith("PUT")) return { type: "put", value: trimmed };
  if (upper.startsWith("ASN")) return { type: "asn", value: trimmed };
  if (upper.startsWith("ADJ")) return { type: "adj", value: trimmed };

  return { type: "location", value: trimmed };
}

function mapReferenceTypeToFilterType(referenceType) {
  const normalized = String(referenceType || "").trim().toLowerCase();
  if (["grn", "do", "rma", "put", "asn", "adj"].includes(normalized)) {
    return normalized;
  }
  return "reference";
}

function toFilterLabel(filterType) {
  return filterTypeLabels[filterType] || "Reference";
}

const TracePage = () => {
  const auth = useAuth();
  const session = useMemo(() => toSessionContext(auth), [auth]);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryState = useMemo(() => parseQueryState(searchParams), [searchParams]);
  const initialQueryStateRef = useRef(queryState);

  const trace = useTraceEvents({
    session,
    initialQuery: initialQueryStateRef.current,
  });
  const { setStateFromQuery } = trace;

  const [searchValue, setSearchValue] = useState(initialQueryStateRef.current.filter?.value || "");

  useEffect(() => {
    setStateFromQuery(queryState);
  }, [setStateFromQuery, queryState]);

  useEffect(() => {
    if (trace.isFiltered && trace.filter?.value) {
      setSearchValue(trace.filter.value);
      return;
    }
    if (!trace.isFiltered) {
      setSearchValue("");
    }
  }, [trace.isFiltered, trace.filter?.type, trace.filter?.value]);

  const nextQueryString = useMemo(
    () =>
      buildQueryString({
        mode: trace.mode,
        filter: trace.filter,
        page: trace.page,
        pageSize: trace.pageSize,
      }),
    [trace.mode, trace.filter, trace.page, trace.pageSize],
  );

  useEffect(() => {
    const currentQueryString = searchParams.toString();
    if (nextQueryString === currentQueryString) {
      return;
    }

    const nextParams = nextQueryString ? new URLSearchParams(nextQueryString) : new URLSearchParams();
    setSearchParams(nextParams, { replace: true });
  }, [nextQueryString, searchParams, setSearchParams]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const filter = inferFilterFromInput(searchValue);
    if (!filter) {
      trace.clearFilter();
      return;
    }
    trace.applyFilter(filter);
  };

  const onSkuFilter = (sku) => {
    if (!sku) {
      return;
    }
    trace.applyFilter({ type: "sku", value: sku });
  };

  const onReferenceFilter = ({ type, value }) => {
    if (!value) {
      return;
    }

    trace.applyFilter({
      type: mapReferenceTypeToFilterType(type),
      value,
    });
  };

  const title = trace.isFiltered
    ? `Trace Timeline - ${trace.filter?.value || "Filtered"}`
    : "Recent Trace Activities";

  const subtitle = trace.isFiltered
    ? `Filtered by ${toFilterLabel(trace.filter?.type)}: ${trace.filter?.value}`
    : "Showing the latest trace events across all SKUs in this warehouse.";

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Trace" }]} />

      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {!session.tenant_id && (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Select a tenant before using the Trace module.
          </CardContent>
        </Card>
      )}

      {session.tenant_id && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={onSearchSubmit} className="flex flex-col gap-2 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search SKU, GRN, EPC, Location..."
                    className="pl-9"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={trace.loading}>Search</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => trace.clearFilter()}
                    disabled={!trace.isFiltered || trace.loading}
                  >
                    Clear Filter
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {trace.isFiltered && <TraceContextCard filter={trace.filter} context={trace.context} />}

          <TraceTimelineCard
            mode={trace.mode}
            events={trace.events}
            loading={trace.loading}
            error={trace.error}
            page={trace.pagination.page}
            pageSize={trace.pagination.pageSize}
            total={trace.pagination.total}
            totalPages={trace.pagination.totalPages}
            onPageChange={trace.setPage}
            onPageSizeChange={trace.setPageSize}
            onClearFilter={trace.clearFilter}
            onSkuClick={onSkuFilter}
            onReferenceClick={onReferenceFilter}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default TracePage;
