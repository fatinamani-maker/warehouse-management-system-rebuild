import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScanEnabledField } from "@/components/shared/ScanEnabledField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { returns } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const ReturnsPage = () => {
  const [scanReturn, setScanReturn] = useState("");
  const { toast } = useToast();

  const columns = [
    { key: "id", label: "RMA", sortable: true },
    { key: "customerName", label: "Customer" },
    { key: "skuId", label: "SKU" },
    { key: "qty", label: "Qty" },
    { key: "reason", label: "Reason" },
    { key: "disposition", label: "Disposition", render: (r: any) => <StatusBadge status={r.disposition} /> },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Returns" }]} />
      <h1 className="text-2xl font-bold mb-4">Returns</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable columns={columns} data={returns} actions={<Button size="sm">+ Create RMA</Button>} />

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Receive Return</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ScanEnabledField value={scanReturn} onChange={setScanReturn} onScan={v => toast({ title: "Return item scanned", description: v })} label="Scan Return Item" />
            <div>
              <Label className="text-xs">Disposition</Label>
              <Select>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select disposition..." /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="restock">Restock</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                  <SelectItem value="scrap">Scrap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" size="sm">Process Return</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReturnsPage;
