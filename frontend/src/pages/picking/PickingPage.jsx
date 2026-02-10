import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPickListById, fetchPickLists, toSessionContext } from "@/services/api";

const initialFilters = {
  search: "",
  status: "",
  waveId: "",
  assignedUser: "",
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

const pickStatusFilters = new Set([
  "open",
  "draft",
  "picking",
  "picked",
  "verified",
  "completed",
  "packed",
  "shipped",
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

function parsePickingStatusFilter(search) {
  const params = new URLSearchParams(search || "");
  const status = String(params.get("status") || "").toLowerCase();
  return pickStatusFilters.has(status) ? status : "";
}

const PickingPage = () => {
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
  const [selectedPickListId, setSelectedPickListId] = useState("");
  const [selectedPickList, setSelectedPickList] = useState(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    const statusFilter = parsePickingStatusFilter(location.search);
    setFilters((current) => ({
      ...current,
      status: statusFilter,
    }));
    setPage(1);
  }, [location.search]);

  const loadList = useCallback(async () => {
    if (!session.tenant_id || !canView) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await fetchPickLists(session, {
        page,
        pageSize,
        ...filters,
      });
      const items = Array.isArray(result?.items) ? result.items : [];
      setRows(items);
      setTotal(Number(result?.total || 0));
      setSelectedPickListId((current) => {
        if (current && items.some((item) => item.pick_list_id === current)) {
          return current;
        }
        return items[0]?.pick_list_id || "";
      });
    } catch (loadError) {
      setRows([]);
      setTotal(0);
      setError(loadError.message || "Failed to load pick lists");
    } finally {
      setLoading(false);
    }
  }, [canView, filters, page, pageSize, session]);

  const loadDetail = useCallback(async (pickListId) => {
    if (!pickListId || !session.tenant_id || !canView) {
      setSelectedPickList(null);
      return;
    }

    try {
      const detail = await fetchPickListById(session, pickListId);
      setSelectedPickList(detail || null);
    } catch (detailError) {
      setSelectedPickList(null);
      setError(detailError.message || "Failed to load pick list details");
    }
  }, [canView, session]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadDetail(selectedPickListId);
  }, [selectedPickListId, loadDetail]);

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
      <Breadcrumbs items={[{ label: "Picking" }]} />
      <h1 className="text-2xl font-bold mb-2">Picking</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Portal execution is read-only. Picking, verification, and item scanning are mobile-owned.
      </p>

      {error && (
        <p className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Search Pick List / Wave / Assigned / Status"
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="picking">Picking</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Wave Reference"
              value={filters.waveId}
              onChange={(event) => updateFilter("waveId", event.target.value)}
            />
            <Input
              placeholder="Assigned User"
              value={filters.assignedUser}
              onChange={(event) => updateFilter("assignedUser", event.target.value)}
            />
          </div>
          <div className="mt-3">
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
                  <th className="px-3 py-2 text-left">Pick List ID</th>
                  <th className="px-3 py-2 text-left">Wave Ref</th>
                  <th className="px-3 py-2 text-left">Assigned User</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Started</th>
                  <th className="px-3 py-2 text-left">Completed</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading pick lists...
                      </span>
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      No pick lists found.
                    </td>
                  </tr>
                )}

                {!loading && rows.map((row) => (
                  <tr
                    key={row.pick_list_id}
                    className={`border-t cursor-pointer hover:bg-accent/40 ${selectedPickListId === row.pick_list_id ? "bg-accent/30" : ""}`}
                    onClick={() => setSelectedPickListId(row.pick_list_id)}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{row.pick_list_id}</td>
                    <td className="px-3 py-2">{row.wave_id || "-"}</td>
                    <td className="px-3 py-2">{row.assigned_to_user_name || "Unassigned"}</td>
                    <td className="px-3 py-2"><StatusBadge status={row.status} /></td>
                    <td className="px-3 py-2">{formatDateTime(row.created_at)}</td>
                    <td className="px-3 py-2">{formatDateTime(row.started_at)}</td>
                    <td className="px-3 py-2">{formatDateTime(row.completed_at)}</td>
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

      {selectedPickList && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {selectedPickList.pick_list_id}
              <StatusBadge status={selectedPickList.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium mb-2">Execution Ownership</p>
              <p className="text-muted-foreground">
                Pick execution and item verification are controlled by mobile API only. Web portal is view-only.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Wave Ref</p>
                <p>{selectedPickList.wave_id || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned User</p>
                <p>{selectedPickList.assigned_to_user_name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Started At</p>
                <p>{formatDateTime(selectedPickList.started_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed At</p>
                <p>{formatDateTime(selectedPickList.completed_at)}</p>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left">Line</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-left">Location</th>
                    <th className="px-3 py-2 text-left">Required</th>
                    <th className="px-3 py-2 text-left">Picked</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPickList.lines || []).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-5 text-center text-muted-foreground">No line items.</td>
                    </tr>
                  )}
                  {(selectedPickList.lines || []).map((line) => (
                    <tr key={`${selectedPickList.pick_list_id}-${line.line_no}`} className="border-t">
                      <td className="px-3 py-2">{line.line_no}</td>
                      <td className="px-3 py-2">{line.sku_id}</td>
                      <td className="px-3 py-2">{line.location_id}</td>
                      <td className="px-3 py-2">{line.qty_required}</td>
                      <td className="px-3 py-2">{line.qty_picked}</td>
                      <td className="px-3 py-2"><StatusBadge status={line.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
};

export default PickingPage;
