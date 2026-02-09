import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScanEnabledField } from "@/components/shared/ScanEnabledField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { shipments, lovGroups } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const ShippingPage = () => {
  const [scanCarton, setScanCarton] = useState("");
  const { toast } = useToast();
  const carriers = lovGroups.find(l => l.id === "carriers")?.values ?? [];

  const columns = [
    { key: "id", label: "Shipment", sortable: true },
    { key: "customerName", label: "Customer" },
    { key: "carrier", label: "Carrier" },
    { key: "trackingNo", label: "Tracking", render: (r: any) => r.trackingNo || "—" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Shipping" }]} />
      <h1 className="text-2xl font-bold mb-4">Shipping</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <DataTable columns={columns} data={shipments} actions={<Button size="sm">+ Create Shipment</Button>} />
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Dispatch</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ScanEnabledField value={scanCarton} onChange={setScanCarton} onScan={v => toast({ title: "Carton scanned", description: v })} label="Scan Cartons" />
            <div>
              <Label className="text-xs">Carrier</Label>
              <Select>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select carrier..." /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {carriers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Proof of Dispatch</Label>
              <div className="border-2 border-dashed rounded-md p-4 text-center text-xs text-muted-foreground">
                Click or drag to upload proof of dispatch (mock)
              </div>
            </div>
            <Button className="w-full" size="sm">Confirm Dispatch</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ShippingPage;
