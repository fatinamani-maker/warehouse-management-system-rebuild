import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { dashboardKPIs, chartData, recentActivities, alerts } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowDownToLine, PackageOpen, Target, ClipboardList, Truck, AlertTriangle, QrCode, Activity, Bell } from "lucide-react";
const kpiCards = [
    {
        label: "Today's Inbound",
        value: dashboardKPIs.todayInbound,
        icon: ArrowDownToLine,
        color: "text-blue-600",
        to: "/inbound?tab=asn&date=today&status=open",
        ariaLabel: "Open inbound page filtered to ASN open records for today",
    },
    {
        label: "Pending Putaway",
        value: dashboardKPIs.pendingPutaway,
        icon: PackageOpen,
        color: "text-amber-600",
        to: "/putaway?status=pending",
        ariaLabel: "Open putaway page filtered to pending tasks",
    },
    { label: "Stock Accuracy", value: `${dashboardKPIs.stockAccuracy}%`, icon: Target, color: "text-emerald-600", to: null, ariaLabel: "Stock accuracy overview" },
    {
        label: "Open Picks",
        value: dashboardKPIs.openPicks,
        icon: ClipboardList,
        color: "text-violet-600",
        to: "/picking?status=open",
        ariaLabel: "Open picking page filtered to open pick lists",
    },
    {
        label: "Overdue Shipments",
        value: dashboardKPIs.overdueShipments,
        icon: Truck,
        color: "text-red-600",
        to: "/shipping?status=overdue",
        ariaLabel: "Open shipping page filtered to overdue shipments",
    },
    {
        label: "Exceptions",
        value: dashboardKPIs.exceptionsCount,
        icon: AlertTriangle,
        color: "text-orange-600",
        to: "/inventory?view=exceptions&status=open",
        ariaLabel: "Open inventory exceptions view with open status",
    },
];
const AGING_COLORS = ["hsl(215, 80%, 48%)", "hsl(200, 80%, 50%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];
const Dashboard = () => {
    const navigate = useNavigate();
    return (<AppLayout>
      <Breadcrumbs items={[{ label: "Dashboard" }]}/>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpiCards.map((kpi) => {
          const clickable = Boolean(kpi.to);
          const handleNavigate = () => {
            if (kpi.to) {
              navigate(kpi.to);
            }
          };
          return (
            <button
              key={kpi.label}
              type="button"
              aria-label={kpi.ariaLabel}
              role={clickable ? "link" : undefined}
              onClick={handleNavigate}
              disabled={!clickable}
              className={`text-left rounded-lg ${clickable ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" : "cursor-default"}`}
            >
              <Card className={clickable ? "transition-all hover:-translate-y-0.5 hover:shadow-md" : ""}>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`}/>
                  </div>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Inbound vs Outbound Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inbound vs Outbound (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.inboundOutbound}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)"/>
                <XAxis dataKey="date" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }}/>
                <Tooltip />
                <Bar dataKey="inbound" fill="hsl(215, 80%, 48%)" radius={[3, 3, 0, 0]}/>
                <Bar dataKey="outbound" fill="hsl(152, 60%, 40%)" radius={[3, 3, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Aging */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inventory Aging</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData.inventoryAging} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={80} label={({ range }) => range}>
                  {chartData.inventoryAging.map((_, i) => <Cell key={i} fill={AGING_COLORS[i]}/>)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Scan Widget */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><QrCode className="h-4 w-4"/>Quick Scan</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Launch QR or RFID scan to trace any SKU instantly.</p>
            <Button className="w-full" onClick={() => navigate("/trace")}>Open Scan Console</Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4"/>Recent Activities</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.map((a, i) => (<div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground w-16 shrink-0">{a.time}</span>
                  <div><span className="font-medium">{a.action}:</span> {a.detail}</div>
                </div>))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4"/>Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((a, i) => (<div key={i} className="flex items-start gap-2 text-xs p-2 rounded border">
                  <StatusBadge status={a.type === "error" ? "damaged" : a.type === "warning" ? "quarantine" : "active"}/>
                  <span>{a.message}</span>
                </div>))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>);
};
export default Dashboard;
