import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchShipments, toSessionContext } from "@/services/api";

const initialFilters = {
  search: "",
  status: "",
  carrier: "",
};

const roleAliases = {
  superadmin: "superadmin",
  hqadmin: "hqadmin",
  storemanager: "storemanager",
  warehouseadmin: "storemanager",
  warehousemanager: "storemanager",
  storeoperator: "storeoperator",
  storekeeper: "storeoperator",
  warehouseclerk: "storeoperator",
  auditor: "auditor",
  readonly: "readonly",
};

const shippingStatuses = new Set([
  "open",
  "overdue",
  "pending",
  "ready",
  "packed",
  "carton_generated",
  "dispatched",
  "closed",
  "cancelled",
]);

function normalizeRole(roleId) {
  return roleAliases[String(roleId || "readonly").toLowerCase()] || "readonly";
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleString();
}

function parseShippingStatusFilter(search) {
  const params = new URLSearchParams(search || "");
  const status = String(params.get("status") || "").toLowerCase();
  return shippingStatuses.has(status) ? status : "";
}

const ShippingPage = () => {
  const location = useLocation();
  const auth = useAuth();
  const session = useMemo(() => toSessionContext(auth), [auth]);
  const roleId = useMemo(() => normalizeRole(auth.currentUser?.role), [auth.currentUser?.role]);
  const canView = useMemo(
    () => ["superadmin", "hqadmin", "storemanager", "storeoperator", "auditor", "readonly"].includes(roleId),
    [roleId],
  );

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    const status = parseShippingStatusFilter(location.search);
    setFilters((current) => ({
      ...current,
      status,
    }));
    setPage(1);
  }, [location.search]);

  const loadShipments = useCallback(async () => {
    if (!session.tenant_id || !canView) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await fetchShipments(session, {
        page,
        pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        carrier: filters.carrier || undefined,
      });

      setRows(Array.isArray(result?.items) ? result.items : []);
      setTotal(Number(result?.total || 0));
    } catch (loadError) {
      setRows([]);
      setTotal(0);
      setError(loadError.message || "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, [canView, filters, page, pageSize, session]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Shipping" }]} />
      <h1 className="text-2xl font-bold mb-4">Shipping</h1>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Search Shipment / Customer / Carrier / Tracking"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="carton_generated">Carton Generated</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Carrier"
              value={filters.carrier}
              onChange={(event) => updateFilter("carrier", event.target.value)}
            />
            <Button variant="outline" onClick={clearFilters}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left">Shipment ID</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Carrier</th>
                  <th className="px-3 py-2 text-left">Tracking</th>
                  <th className="px-3 py-2 text-left">Dispatch Due</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading shipments...
                      </span>
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      No shipments found.
                    </td>
                  </tr>
                )}

                {!loading && rows.map((row) => (
                  <tr key={row.shipment_id} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">{row.shipment_id}</td>
                    <td className="px-3 py-2">{row.customer_name || "-"}</td>
                    <td className="px-3 py-2">{row.carrier || "-"}</td>
                    <td className="px-3 py-2">{row.tracking_no || "-"}</td>
                    <td className="px-3 py-2">{formatDateTime(row.dispatch_due_at || row.ship_by)}</td>
                    <td className="px-3 py-2"><StatusBadge status={row.status} /></td>
                    <td className="px-3 py-2">
                      {row.is_overdue ? <span className="text-xs font-medium text-amber-700">Overdue</span> : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <div className="text-muted-foreground">
              {total} result{total === 1 ? "" : "s"} | Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[92px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ShippingPage;
