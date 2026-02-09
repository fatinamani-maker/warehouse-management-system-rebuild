import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { lovGroups } from "@/data/mockData";
import { Trash2, Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LOVMaintenancePage = () => {
  const [selected, setSelected] = useState<typeof lovGroups[0] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const { toast } = useToast();

  const columns = [
    { key: "id", label: "Group ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "values", label: "Values", render: (r: any) => <span className="text-xs">{r.values.length} items</span> },
    { key: "usedIn", label: "Used In", render: (r: any) => r.usedIn.map((u: string) => <Badge key={u} variant="outline" className="text-[10px] mr-1">{u}</Badge>) },
    { key: "lastUpdated", label: "Updated", sortable: true },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "LOV Maintenance" }]} />
      <h1 className="text-2xl font-bold mb-4">List of Values (LOV) Maintenance</h1>

      <DataTable columns={columns} data={lovGroups} onRowClick={setSelected} actions={<Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Group</Button>} />

      {selected && (
        <Card className="mt-4">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{selected.name} — Values</CardTitle>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAdd(true)}><Plus className="h-3 w-3" /> Add Value</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {selected.values.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded border text-sm hover:bg-accent/50">
                  <span>{v}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteConfirm(v)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p><strong>Used in:</strong> {selected.usedIn.join(", ")}</p>
              <p><strong>Last updated:</strong> {selected.lastUpdated}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { toast({ title: "Deleted (mock)", description: `Removed: ${deleteConfirm}` }); setDeleteConfirm(null); }}
        title="Delete LOV Value"
        description={`Are you sure you want to delete "${deleteConfirm}"? This may affect screens that use this value.`}
      />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Value</DialogTitle></DialogHeader>
          <div><Label className="text-xs">Value</Label><Input placeholder="New value..." className="h-9" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => { setShowAdd(false); toast({ title: "Value added (mock)" }); }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LOVMaintenancePage;
