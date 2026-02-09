import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScanEnabledField } from "@/components/shared/ScanEnabledField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { putawayTasks } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const PutawayPage = () => {
  const [selected, setSelected] = useState<typeof putawayTasks[0] | null>(null);
  const [scanSrc, setScanSrc] = useState("");
  const [scanDst, setScanDst] = useState("");
  const { toast } = useToast();

  const columns = [
    { key: "id", label: "Task ID", sortable: true },
    { key: "grnId", label: "GRN" },
    { key: "skuId", label: "SKU" },
    { key: "qty", label: "Qty" },
    { key: "sourceLocation", label: "Source" },
    { key: "suggestedBin", label: "Suggested Bin" },
    { key: "priority", label: "Priority", render: (r: any) => <StatusBadge status={r.priority} /> },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Putaway" }]} />
      <h1 className="text-2xl font-bold mb-4">Putaway Tasks</h1>
      <DataTable columns={columns} data={putawayTasks} onRowClick={setSelected} />

      {selected && (
        <Card className="mt-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Task {selected.id} — Confirm Putaway</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-xs text-muted-foreground block">SKU</span>{selected.skuId}</div>
              <div><span className="text-xs text-muted-foreground block">Qty</span>{selected.qty}</div>
              <div><span className="text-xs text-muted-foreground block">Source</span>{selected.sourceLocation}</div>
              <div><span className="text-xs text-muted-foreground block">Suggested Bin</span>{selected.suggestedBin}</div>
            </div>
            <ScanEnabledField value={scanSrc} onChange={setScanSrc} onScan={() => toast({ title: "Source confirmed" })} label="Scan Source Location" placeholder="Scan source dock..." />
            <ScanEnabledField value={scanDst} onChange={setScanDst} onScan={() => toast({ title: "Destination confirmed" })} label="Scan Destination Bin" placeholder="Scan bin location..." />
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
};

export default PutawayPage;
