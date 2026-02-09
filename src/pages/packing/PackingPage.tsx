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
import { packOrders, lovGroups } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const PackingPage = () => {
  const [scanPL, setScanPL] = useState("");
  const [scanItem, setScanItem] = useState("");
  const { toast } = useToast();
  const packagingTypes = lovGroups.find(l => l.id === "packaging_types")?.values ?? [];

  const columns = [
    { key: "id", label: "Pack ID", sortable: true },
    { key: "pickListId", label: "Pick List" },
    { key: "cartonId", label: "Carton" },
    { key: "packaging", label: "Packaging" },
    { key: "weight", label: "Weight (kg)" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Packing" }]} />
      <h1 className="text-2xl font-bold mb-4">Packing</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pack Station</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ScanEnabledField value={scanPL} onChange={setScanPL} onScan={v => toast({ title: "Pick list loaded", description: v })} label="Scan Pick List" />
            <ScanEnabledField value={scanItem} onChange={setScanItem} onScan={v => toast({ title: "Item verified", description: v })} label="Scan Items to Verify" />
            <div>
              <Label className="text-xs">Packaging Type</Label>
              <Select>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select packaging..." /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {packagingTypes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" size="sm">Generate Carton Label</Button>
          </CardContent>
        </Card>

        <div>
          <DataTable columns={columns} data={packOrders} />
        </div>
      </div>
    </AppLayout>
  );
};

export default PackingPage;
