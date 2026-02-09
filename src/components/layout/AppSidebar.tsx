import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, PackageOpen, ArrowDownToLine, Warehouse, ClipboardList,
  Package, Truck, RotateCcw, QrCode, Database, Users, List, FileText,
  Settings, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Inbound", icon: ArrowDownToLine, path: "/inbound" },
  { label: "Putaway", icon: PackageOpen, path: "/putaway" },
  { label: "Inventory", icon: Warehouse, path: "/inventory" },
  { label: "Picking", icon: ClipboardList, path: "/picking" },
  { label: "Packing", icon: Package, path: "/packing" },
  { label: "Shipping", icon: Truck, path: "/shipping" },
  { label: "Returns", icon: RotateCcw, path: "/returns" },
  { label: "Trace (QR/RF)", icon: QrCode, path: "/trace" },
  { label: "Master Data", icon: Database, path: "/master-data" },
  { label: "Users & Roles", icon: Users, path: "/users" },
  { label: "LOV Maintenance", icon: List, path: "/lov" },
  { label: "Audit Log", icon: FileText, path: "/audit" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200 shrink-0",
      collapsed ? "w-16" : "w-56"
    )}>
      <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border">
        {!collapsed && <span className="font-bold text-lg tracking-tight text-sidebar-primary">WMS</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded hover:bg-sidebar-accent text-sidebar-muted">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="px-3 py-3 border-t border-sidebar-border text-xs text-sidebar-muted">
          WMS v1.0 — Mockup
        </div>
      )}
    </aside>
  );
};
