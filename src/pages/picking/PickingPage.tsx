import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScanEnabledField } from "@/components/shared/ScanEnabledField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pickLists, skus, locations } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const PickingPage = () => {
  const [selected, setSelected] = useState<typeof pickLists[0] | null>(null);
  const [scanBin, setScanBin] = useState("");
  const [scanItem, setScanItem] = useState("");
  const { toast } = useToast();

  const plColumns = [
    { key: "id", label: "Pick List", sortable: true },
    { key: "waveId", label: "Wave" },
    { key: "assignedTo", label: "Assigned" },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Picking" }]} />
      <h1 className="text-2xl font-bold mb-4">Picking</h1>

      <Tabs defaultValue="lists">
        <TabsList>
          <TabsTrigger value="waves">Wave Planning</TabsTrigger>
          <TabsTrigger value="lists">Pick Lists</TabsTrigger>
          <TabsTrigger value="execute">Pick Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="waves" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground">Wave planning — group orders into pick waves for efficiency. <Button className="mt-3" size="sm">+ Create Wave</Button></CardContent></Card>
        </TabsContent>

        <TabsContent value="lists" className="mt-4">
          <DataTable columns={plColumns} data={pickLists} onRowClick={setSelected} />
          {selected && (
            <Card className="mt-4">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{selected.id} — Lines</CardTitle></CardHeader>
              <CardContent>
                <DataTable columns={[
                  { key: "skuId", label: "SKU" },
                  { key: "locationId", label: "Location", render: (r: any) => locations.find(l => l.id === r.locationId)?.label ?? r.locationId },
                  { key: "qtyRequired", label: "Required" },
                  { key: "qtyPicked", label: "Picked" },
                  { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
                ]} data={selected.lines} searchable={false} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="execute" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pick Execution</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium">Next Pick: SKU000001 — Industrial Bearing</p>
                <p className="text-xs text-muted-foreground">Bin: A-01-001 · Qty: 50</p>
              </div>
              <ScanEnabledField value={scanBin} onChange={setScanBin} onScan={() => toast({ title: "Bin confirmed" })} label="Step 1: Scan Bin" placeholder="Scan bin location..." />
              <ScanEnabledField value={scanItem} onChange={setScanItem} onScan={() => toast({ title: "Item confirmed" })} label="Step 2: Scan Item" placeholder="Scan item QR/RFID..." />
              <div className="flex gap-2">
                <Button size="sm">Confirm Pick</Button>
                <Button size="sm" variant="outline">Short Pick</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default PickingPage;
