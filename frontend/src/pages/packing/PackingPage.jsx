import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  confirmPacking,
  createPackingCarton,
  fetchPackingOptions,
  fetchPackingOrderById,
  fetchPackingOrders,
  generatePackingLabel,
  toSessionContext,
} from "@/services/api";

const initialFilters = {
  search: "",
  status: "",
  pickListId: "",
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

function isPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

const PackingPage = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const session = useMemo(() => toSessionContext(auth), [auth]);
  const roleId = useMemo(() => normalizeRole(auth.currentUser?.role), [auth.currentUser?.role]);
  const canView = useMemo(
    () => ["superadmin", "hqadmin", "storemanager", "storeoperator", "auditor", "readonly"].includes(roleId),
    [roleId],
  );
  const canManage = useMemo(() => ["superadmin", "hqadmin", "storemanager"].includes(roleId), [roleId]);

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedPackId, setSelectedPackId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [packagingTypes, setPackagingTypes] = useState([]);
  const [packagingType, setPackagingType] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [confirmPackOpen, setConfirmPackOpen] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const canConfirmPack = useMemo(() => isPositiveNumber(weightKg), [weightKg]);
  const isPickListCompleted = useMemo(
    () => String(selectedOrder?.pick_list_status || "").toLowerCase() === "completed",
    [selectedOrder?.pick_list_status],
  );

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
      const result = await fetchPackingOrders(session, {
        page,
        pageSize,
        ...filters,
      });
      const items = Array.isArray(result?.items) ? result.items : [];
      setRows(items);
      setTotal(Number(result?.total || 0));
      setSelectedPackId((current) => {
        if (current && items.some((item) => item.pack_id === current)) {
          return current;
        }
        return items[0]?.pack_id || "";
      });
    } catch (loadError) {
      setRows([]);
      setTotal(0);
      setError(loadError.message || "Failed to load packing orders");
    } finally {
      setLoading(false);
    }
  }, [canView, filters, page, pageSize, session]);

  const loadDetail = useCallback(async (packId) => {
    if (!packId || !session.tenant_id || !canView) {
      setSelectedOrder(null);
      return;
    }

    try {
      const detail = await fetchPackingOrderById(session, packId);
      setSelectedOrder(detail || null);
    } catch (detailError) {
      setSelectedOrder(null);
      setError(detailError.message || "Failed to load pack order details");
    }
  }, [canView, session]);

  const loadOptions = useCallback(async () => {
    if (!session.tenant_id || !canView) {
      setPackagingTypes([]);
      return;
    }
    try {
      const result = await fetchPackingOptions(session);
      const options = Array.isArray(result?.packaging_types) ? result.packaging_types : [];
      setPackagingTypes(options);
    } catch (_error) {
      setPackagingTypes([]);
    }
  }, [canView, session]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadDetail(selectedPackId);
  }, [selectedPackId, loadDetail]);

  useEffect(() => {
    if (!selectedOrder) {
      setPackagingType("");
      setWeightKg("");
      return;
    }
    setPackagingType(selectedOrder.packaging_type || "");
    setWeightKg(selectedOrder.weight_kg ? String(selectedOrder.weight_kg) : "");
  }, [selectedOrder]);

  const refreshData = async (packId = selectedPackId) => {
    await loadList();
    if (packId) {
      await loadDetail(packId);
    }
  };

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

  const handleCreateCarton = async () => {
    if (!selectedOrder || !canManage) {
      return;
    }
    if (!packagingType) {
      setError("Packaging type is required before creating carton");
      return;
    }

    try {
      setBusyAction("create-carton");
      setError("");
      const result = await createPackingCarton(session, selectedOrder.pack_id, {
        packaging_type: packagingType,
      });
      toast({
        title: "Carton created",
        description: result?.message || `Carton created for ${selectedOrder.pack_id}`,
      });
      await refreshData(selectedOrder.pack_id);
    } catch (actionError) {
      const message = actionError.message || "Unable to create carton";
      setError(message);
      toast({ title: "Create carton failed", description: message, variant: "destructive" });
    } finally {
      setBusyAction("");
    }
  };

  const handleGenerateLabel = async () => {
    if (!selectedOrder || !canManage) {
      return;
    }

    try {
      setBusyAction("generate-label");
      setError("");
      const payload = isPositiveNumber(weightKg) ? { weight_kg: Number(weightKg) } : {};
      const result = await generatePackingLabel(session, selectedOrder.pack_id, payload);
      toast({
        title: "Carton label generated",
        description: result?.message || `Label generated for ${selectedOrder.pack_id}`,
      });
      await refreshData(selectedOrder.pack_id);
    } catch (actionError) {
      const message = actionError.message || "Unable to generate carton label";
      setError(message);
      toast({ title: "Generate label failed", description: message, variant: "destructive" });
    } finally {
      setBusyAction("");
    }
  };

  const handleConfirmPacking = async () => {
    if (!selectedOrder || !canManage) {
      return;
    }
    if (!canConfirmPack) {
      setError("Weight must be a positive number before confirming packing");
      return;
    }

    try {
      setBusyAction("confirm-pack");
      setError("");
      const result = await confirmPacking(session, selectedOrder.pack_id, {
        weight_kg: Number(weightKg),
      });
      toast({
        title: "Packing confirmed",
        description: result?.message || `Pack order ${selectedOrder.pack_id} marked as packed`,
      });
      setConfirmPackOpen(false);
      await refreshData(selectedOrder.pack_id);
    } catch (actionError) {
      const message = actionError.message || "Unable to confirm packing";
      setError(message);
      toast({ title: "Confirm packing failed", description: message, variant: "destructive" });
    } finally {
      setBusyAction("");
    }
  };

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Packing" }]} />
      <h1 className="text-2xl font-bold mb-2">Packing</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Packing portal is scan-free. Item scanning and pick verification remain mobile-owned.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              placeholder="Search Pack ID / Pick List / Carton / Status"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
            <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="carton_generated">Carton Generated</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Pick List ID"
              value={filters.pickListId}
              onChange={(event) => updateFilter("pickListId", event.target.value)}
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
                  <th className="px-3 py-2 text-left">Pack ID</th>
                  <th className="px-3 py-2 text-left">Pick List</th>
                  <th className="px-3 py-2 text-left">Pick Status</th>
                  <th className="px-3 py-2 text-left">Carton</th>
                  <th className="px-3 py-2 text-left">Packaging</th>
                  <th className="px-3 py-2 text-left">Weight (kg)</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading packing orders...
                      </span>
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      No packing orders found.
                    </td>
                  </tr>
                )}

                {!loading && rows.map((row) => (
                  <tr
                    key={row.pack_id}
                    className={`border-t cursor-pointer hover:bg-accent/40 ${selectedPackId === row.pack_id ? "bg-accent/30" : ""}`}
                    onClick={() => setSelectedPackId(row.pack_id)}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{row.pack_id}</td>
                    <td className="px-3 py-2">{row.pick_list_id || "-"}</td>
                    <td className="px-3 py-2">{row.pick_list_status ? <StatusBadge status={row.pick_list_status} /> : "-"}</td>
                    <td className="px-3 py-2">{row.carton_id || "-"}</td>
                    <td className="px-3 py-2">{row.packaging_type || "-"}</td>
                    <td className="px-3 py-2">{row.weight_kg ?? "-"}</td>
                    <td className="px-3 py-2"><StatusBadge status={row.status} /></td>
                    <td className="px-3 py-2">{formatDateTime(row.created_at)}</td>
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

      {selectedOrder && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {selectedOrder.pack_id}
              <StatusBadge status={selectedOrder.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Pick List</p>
                <p>{selectedOrder.pick_list_id || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pick List Status</p>
                <p>{selectedOrder.pick_list_status ? <StatusBadge status={selectedOrder.pick_list_status} /> : "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Carton ID</p>
                <p>{selectedOrder.carton_id || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Label Generated</p>
                <p>{formatDateTime(selectedOrder.label_generated_at)}</p>
              </div>
            </div>

            {!isPickListCompleted && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Packing can start only when linked Pick List status is COMPLETED.
              </div>
            )}

            <div className="rounded-md border p-3">
              <p className="text-sm font-medium mb-3">Pack Station Controls</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="packaging-type">Packaging Type</Label>
                  <Select
                    value={packagingType || "none"}
                    onValueChange={(value) => setPackagingType(value === "none" ? "" : value)}
                    disabled={!canManage || busyAction !== ""}
                  >
                    <SelectTrigger id="packaging-type" className="mt-1">
                      <SelectValue placeholder="Select packaging type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select packaging type</SelectItem>
                      {packagingTypes.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weight-kg">Weight (kg)</Label>
                  <Input
                    id="weight-kg"
                    className="mt-1"
                    type="number"
                    step="0.01"
                    min="0"
                    value={weightKg}
                    onChange={(event) => setWeightKg(event.target.value)}
                    disabled={!canManage || busyAction !== ""}
                    placeholder="Enter carton weight"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleCreateCarton}
                  disabled={!canManage || !isPickListCompleted || busyAction !== ""}
                >
                  {busyAction === "create-carton" ? "Creating..." : "Create Carton"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateLabel}
                  disabled={!canManage || !isPickListCompleted || busyAction !== ""}
                >
                  {busyAction === "generate-label" ? "Generating..." : "Generate Carton Label"}
                </Button>
                <Button
                  onClick={() => setConfirmPackOpen(true)}
                  disabled={!canManage || !isPickListCompleted || busyAction !== "" || !canConfirmPack}
                >
                  Confirm Packing
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left">Line</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-left">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.lines || []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-5 text-center text-muted-foreground">No line items.</td>
                    </tr>
                  )}
                  {(selectedOrder.lines || []).map((line) => (
                    <tr key={`${selectedOrder.pack_id}-${line.line_no}`} className="border-t">
                      <td className="px-3 py-2">{line.line_no}</td>
                      <td className="px-3 py-2">{line.sku_id}</td>
                      <td className="px-3 py-2">{line.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmModal
        open={confirmPackOpen}
        onClose={() => setConfirmPackOpen(false)}
        onConfirm={handleConfirmPacking}
        title="Confirm Packing"
        description={selectedOrder ? `Confirm pack order ${selectedOrder.pack_id} as PACKED? This action is irreversible.` : "Confirm packing"}
        confirmLabel={busyAction === "confirm-pack" ? "Confirming..." : "Confirm Pack"}
        cancelLabel="Back"
        variant="default"
      />
    </AppLayout>
  );
};

export default PackingPage;
