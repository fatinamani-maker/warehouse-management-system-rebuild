import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users, roles, permissions, rolePermissions } from "@/data/mockData";
import { Checkbox } from "@/components/ui/checkbox";
const UsersRolesPage = () => {
    const [viewAsRole, setViewAsRole] = useState(null);
    const userColumns = [
        { key: "id", label: "User ID", sortable: true },
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", render: (r) => <Badge variant="outline" className="text-xs">{r.role}</Badge> },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status}/> },
        { key: "lastLogin", label: "Last Login", render: (r) => new Date(r.lastLogin).toLocaleDateString() },
    ];
    const roleColumns = [
        { key: "id", label: "Role ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
    ];
    const permGroups = [...new Set(permissions.map(p => p.split(".")[0]))];
    return (<AppLayout>
      <Breadcrumbs items={[{ label: "Users & Roles" }]}/>
      <h1 className="text-2xl font-bold mb-4">Users & Roles</h1>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <DataTable columns={userColumns} data={users} actions={<Button size="sm">+ Invite User</Button>}/>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <DataTable columns={roleColumns} data={roles} onRowClick={r => setViewAsRole(r.id)}/>
          {viewAsRole && (<Card className="mt-4">
              <CardHeader className="pb-2"><CardTitle className="text-sm">View as: {viewAsRole}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {rolePermissions[viewAsRole]?.map(p => (<Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>))}
                </div>
              </CardContent>
            </Card>)}
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Permission</th>
                    {roles.map(r => <th key={r.id} className="p-2 border-b text-center">{r.id}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(p => (<tr key={p} className="hover:bg-accent/50">
                      <td className="p-2 border-b font-mono">{p}</td>
                      {roles.map(r => (<td key={r.id} className="p-2 border-b text-center">
                          <Checkbox checked={rolePermissions[r.id]?.includes(p)} disabled/>
                        </td>))}
                    </tr>))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>);
};
export default UsersRolesPage;
