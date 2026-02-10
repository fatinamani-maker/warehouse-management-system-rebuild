import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { tenants } from "@/data/mockData";
import { Search, Bell, User, ChevronDown, LogOut, Shield, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
export const TopBar = () => {
    const auth = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSession, setShowSession] = useState(false);
    const [showTenantConfirm, setShowTenantConfirm] = useState(null);
    const handleTenantSwitch = (tenantId) => {
        setShowTenantConfirm(tenantId);
    };
    const confirmTenantSwitch = () => {
        if (showTenantConfirm) {
            auth.selectTenant(showTenantConfirm);
            setShowTenantConfirm(null);
        }
    };
    return (<>
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Tenant Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Building2 className="h-3.5 w-3.5"/>
                <span className="max-w-[120px] truncate">{auth.getTenantName() || "Select Tenant"}</span>
                <ChevronDown className="h-3 w-3"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              {auth.getUserTenants().map(t => (<DropdownMenuItem key={t.id} onClick={() => handleTenantSwitch(t.id)}>
                  {t.name}
                  {t.id === auth.currentTenantId && <Badge variant="secondary" className="ml-2 text-[10px]">Current</Badge>}
                </DropdownMenuItem>))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Warehouse Selector */}
          {auth.currentTenantId && (<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <span className="max-w-[140px] truncate">{auth.getWarehouseName() || "Select Warehouse"}</span>
                  <ChevronDown className="h-3 w-3"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover z-50">
                {auth.getUserWarehouses().map(w => (<DropdownMenuItem key={w.id} onClick={() => auth.selectWarehouse(w.id)}>
                    {w.name} — {w.city}
                    {w.id === auth.currentWarehouseId && <Badge variant="secondary" className="ml-2 text-[10px]">Current</Badge>}
                  </DropdownMenuItem>))}
              </DropdownMenuContent>
            </DropdownMenu>)}
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search SKU, GRN, EPC, Location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm"/>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4"/>
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <User className="h-4 w-4"/>
                <span className="text-sm max-w-[100px] truncate">{auth.currentUser?.name}</span>
                <ChevronDown className="h-3 w-3"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50 w-48">
              <DropdownMenuItem onClick={() => setShowSession(true)}>
                <Shield className="h-3.5 w-3.5 mr-2"/> Session Info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={auth.signOut} className="text-destructive">
                <LogOut className="h-3.5 w-3.5 mr-2"/> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Session Info Dialog */}
      <Dialog open={showSession} onOpenChange={setShowSession}>
        <DialogContent>
          <DialogHeader><DialogTitle>Session Information</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">User:</span><span>{auth.currentUser?.name}</span>
              <span className="text-muted-foreground">Email:</span><span>{auth.currentUser?.email}</span>
              <span className="text-muted-foreground">Role:</span><Badge variant="outline">{auth.currentUser?.role}</Badge>
              <span className="text-muted-foreground">Tenant ID:</span><span className="font-mono text-xs">{auth.currentTenantId}</span>
              <span className="text-muted-foreground">Warehouse ID:</span><span className="font-mono text-xs">{auth.currentWarehouseId}</span>
              <span className="text-muted-foreground">Token Expiry:</span><span className="font-mono text-xs">{auth.tokenExpiry ? new Date(auth.tokenExpiry).toLocaleTimeString() : "—"}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tenant Switch Confirmation */}
      <Dialog open={!!showTenantConfirm} onOpenChange={() => setShowTenantConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Switch Tenant?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Switching tenants will clear your current warehouse selection. Any unsaved changes will be lost.</p>
          <p className="text-sm font-medium">Switch to: {tenants.find(t => t.id === showTenantConfirm)?.name}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTenantConfirm(null)}>Cancel</Button>
            <Button onClick={confirmTenantSwitch}>Confirm Switch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
};
