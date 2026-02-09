import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { auditLog } from "@/data/mockData";
import { Download, ShieldAlert } from "lucide-react";

const AuditLogPage = () => {
  const columns = [
    { key: "timestamp", label: "Time", sortable: true, render: (r: any) => new Date(r.timestamp).toLocaleString() },
    { key: "userName", label: "User", sortable: true },
    { key: "action", label: "Action", render: (r: any) => <Badge variant="outline" className="text-[10px] capitalize">{r.action}</Badge> },
    { key: "entity", label: "Entity" },
    { key: "entityId", label: "Entity ID", render: (r: any) => <span className="font-mono text-xs">{r.entityId}</span> },
    { key: "details", label: "Details" },
    { key: "tenantId", label: "Tenant", render: (r: any) => <span className="font-mono text-xs">{r.tenantId}</span> },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Audit Log" }]} />
      <h1 className="text-2xl font-bold mb-4">Audit Log</h1>

      <Card className="mb-4">
        <CardContent className="py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4" />
          PII data is masked in exported logs. Sensitive operations are flagged for compliance review.
        </CardContent>
      </Card>

      <DataTable columns={columns} data={auditLog} actions={<Button size="sm" variant="outline" className="gap-1"><Download className="h-3.5 w-3.5" /> Export</Button>} />
    </AppLayout>
  );
};

export default AuditLogPage;
