import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WorkflowStepper } from "@/components/shared/WorkflowStepper";
import { ScanEnabledField } from "@/components/shared/ScanEnabledField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { asns, grns } from "@/data/mockData";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const InboundPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<typeof grns[0] | null>(null);
  const [scanValue, setScanValue] = useState("");
  const { toast } = useToast();

  const asnColumns = [
    { key: "id", label: "ASN ID", sortable: true },
    { key: "supplierName", label: "Supplier", sortable: true },
    { key: "eta", label: "ETA", sortable: true },
    { key: "lines", label: "Lines" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  const grnColumns = [
    { key: "id", label: "GRN ID", sortable: true },
    { key: "asnId", label: "ASN", render: (r: any) => r.asnId || "—" },
    { key: "receivedDate", label: "Date", sortable: true },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Inbound" }]} />
      <h1 className="text-2xl font-bold mb-4">Inbound</h1>

      <Tabs defaultValue="asn">
        <TabsList>
          <TabsTrigger value="asn">ASN</TabsTrigger>
          <TabsTrigger value="grn">Goods Receipt</TabsTrigger>
          <TabsTrigger value="receiving">Receiving</TabsTrigger>
        </TabsList>

        <TabsContent value="asn" className="mt-4">
          <DataTable columns={asnColumns} data={asns} actions={<Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="h-3.5 w-3.5" /> Create ASN</Button>} />
        </TabsContent>

        <TabsContent value="grn" className="mt-4">
          <DataTable columns={grnColumns} data={grns} onRowClick={setSelectedGrn} actions={<Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Create GRN</Button>} />

          {selectedGrn && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">GRN {selectedGrn.id} — Lines</CardTitle>
                <WorkflowStepper steps={[
                  { label: "Draft", status: selectedGrn.status === "draft" ? "current" : "completed" },
                  { label: "Receiving", status: selectedGrn.status === "receiving" ? "current" : selectedGrn.status === "draft" ? "pending" : "completed" },
                  { label: "Completed", status: selectedGrn.status === "completed" ? "current" : ["posted"].includes(selectedGrn.status) ? "completed" : "pending" },
                  { label: "Posted", status: selectedGrn.status === "posted" ? "completed" : "pending" },
                ]} />
              </CardHeader>
              <CardContent>
                <DataTable columns={[
                  { key: "skuId", label: "SKU" },
                  { key: "expected", label: "Expected" },
                  { key: "received", label: "Received" },
                  { key: "discrepancy", label: "Discrepancy", render: (r: any) => <span className={r.discrepancy < 0 ? "text-destructive font-medium" : ""}>{r.discrepancy}</span> },
                  { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
                ]} data={selectedGrn.lines} searchable={false} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="receiving" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Receiving — Scan Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ScanEnabledField value={scanValue} onChange={setScanValue} onScan={v => toast({ title: "Scanned", description: `Received: ${v}` })} placeholder="Scan item QR/RFID..." label="Scan incoming item" />
              <div className="text-xs text-muted-foreground">Scan items at the dock to match against GRN line items. Discrepancies are flagged automatically.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create ASN Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create ASN</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Supplier</Label><Input placeholder="Select supplier..." className="h-9" /></div>
            <div><Label className="text-xs">Expected Arrival</Label><Input type="date" className="h-9" /></div>
            <div><Label className="text-xs">Notes</Label><Input placeholder="Optional notes..." className="h-9" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => { setShowCreate(false); toast({ title: "ASN Created (mock)" }); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default InboundPage;
