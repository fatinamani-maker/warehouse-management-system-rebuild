import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScanEnabledField } from "@/components/shared/ScanEnabledField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stockOnHand, skus, locations, cycleCounts } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const InventoryPage = () => {
  const [scanValue, setScanValue] = useState("");
  const { toast } = useToast();

  const enrichedStock = stockOnHand.map(s => ({
    ...s,
    skuDesc: skus.find(sk => sk.id === s.skuId)?.description ?? "",
    location: locations.find(l => l.id === s.locationId)?.label ?? s.locationId,
  }));

  const stockColumns = [
    { key: "skuId", label: "SKU", sortable: true },
    { key: "skuDesc", label: "Description" },
    { key: "location", label: "Location" },
    { key: "qty", label: "On Hand", sortable: true },
    { key: "reserved", label: "Reserved" },
    { key: "available", label: "Available" },
    { key: "quarantine", label: "Quarantine", render: (r: any) => r.quarantine > 0 ? <span className="text-destructive font-medium">{r.quarantine}</span> : "0" },
  ];

  const ccColumns = [
    { key: "id", label: "Count ID", sortable: true },
    { key: "zone", label: "Zone" },
    { key: "plannedDate", label: "Date", sortable: true },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Inventory" }]} />
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock on Hand</TabsTrigger>
          <TabsTrigger value="cycle">Cycle Count</TabsTrigger>
          <TabsTrigger value="adjust">Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-4">
          <DataTable columns={stockColumns} data={enrichedStock} />
        </TabsContent>

        <TabsContent value="cycle" className="mt-4">
          <DataTable columns={ccColumns} data={cycleCounts} actions={<Button size="sm">+ New Count Plan</Button>} />
          <Card className="mt-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Count Execution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ScanEnabledField value={scanValue} onChange={setScanValue} onScan={v => toast({ title: "Counted", description: v })} label="Scan item for counting" />
              <p className="text-xs text-muted-foreground">Scan each item at its bin location. Variances are auto-calculated and require approval.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjust" className="mt-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Inventory adjustments require manager approval. Use this tab to submit adjustment requests.</p>
              <Button className="mt-3" size="sm">+ New Adjustment</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default InventoryPage;
