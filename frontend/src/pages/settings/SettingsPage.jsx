import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Shield, Radio, QrCode, Code, AlertTriangle } from "lucide-react";
const SettingsPage = () => {
    const { getTenantName, currentTenantId } = useAuth();
    return (<AppLayout>
      <Breadcrumbs items={[{ label: "Settings" }]}/>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <Tabs defaultValue="tenant">
        <TabsList>
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="dev">Dev Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4"/>Tenant Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Tenant Name</Label><Input value={getTenantName()} readOnly className="h-9"/></div>
                <div><Label className="text-xs">Tenant ID</Label><Input value={currentTenantId || ""} readOnly className="h-9 font-mono"/></div>
              </div>
              <div><Label className="text-xs">Default Warehouse</Label><Input value="WH000001 — Main Distribution Center" readOnly className="h-9"/></div>
              <Button size="sm">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4"/>Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Password Policy</Label><p className="text-muted-foreground text-xs">Min 12 chars, 1 uppercase, 1 number, 1 special</p></div>
                <div><Label className="text-xs">Session Timeout</Label><p className="text-muted-foreground text-xs">60 minutes of inactivity</p></div>
                <div><Label className="text-xs">MFA</Label><Badge variant="outline" className="text-xs">Available via Clerk</Badge></div>
                <div><Label className="text-xs">JWT Token</Label><p className="text-muted-foreground text-xs">RS256, 1-hour expiry, refresh enabled</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radio className="h-4 w-4"/>RFID Reader</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label className="text-xs">Reader Endpoint</Label><Input placeholder="ws://rfid-reader.local:8080" className="h-9 font-mono text-xs"/></div>
                <div><Label className="text-xs">Antenna Power (dBm)</Label><Input type="number" defaultValue={25} className="h-9"/></div>
                <Button size="sm">Test Connection</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><QrCode className="h-4 w-4"/>QR Scanner</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>QR scanning uses the device camera or a connected handheld scanner.</p>
                <p>Supported formats: QR Code, Code 128, EAN-13</p>
                <p>For handheld scanners, ensure they are configured in keyboard wedge mode.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dev" className="mt-4">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Code className="h-4 w-4"/>Developer Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-2 p-3 bg-card rounded border">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"/>
                <div>
                  <p className="font-medium">Sensitive information must only be stored in .env files</p>
                  <p className="text-muted-foreground mt-1">API keys, database credentials, JWT secrets, and RFID reader credentials should never be hardcoded in source code or displayed in the UI.</p>
                </div>
              </div>
              <div className="font-mono text-[11px] bg-card p-3 rounded border space-y-1">
                <p># .env example</p>
                <p>DATABASE_URL=postgresql://...</p>
                <p>JWT_SECRET=••••••••••••••••</p>
                <p>CLERK_SECRET_KEY=••••••••••••••••</p>
                <p>RFID_READER_AUTH=••••••••••••••••</p>
              </div>
              <div className="text-muted-foreground">
                <p><strong>Frontend:</strong> React app on port 3000</p>
                <p><strong>Backend:</strong> Node.js API on port 4000</p>
                <p>Both run independently. CORS configured for local dev.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>);
};
export default SettingsPage;
