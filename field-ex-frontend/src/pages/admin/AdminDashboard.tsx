import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Truck, Globe, ShieldCheck, Warehouse, FileText, Anchor, Sprout, ArrowRight, UserCheck, Activity, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { adminApi, type AuditLogDto } from '../../services/adminApi';

const dummyData = [
  { name: 'Jan', revenue: 4000, orders: 24 },
  { name: 'Feb', revenue: 3000, orders: 13 },
  { name: 'Mar', revenue: 2000, orders: 98 },
  { name: 'Apr', revenue: 2780, orders: 39 },
  { name: 'May', revenue: 1890, orders: 48 },
  { name: 'Jun', revenue: 2390, orders: 38 },
  { name: 'Jul', revenue: 3490, orders: 43 },
];

export default function AdminDashboard() {
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await adminApi.getRecentAuditLogs();
      setAuditLogs(Array.isArray(logs) ? logs.slice(0, 8) : []);
    } catch {
      // Keep silent fallback
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);
  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Sprout className="w-3 h-3 text-tertiary" />
            <span>Executive Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Admin Overview</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Cross-functional visibility over procurement batches, cold storage, and export shipments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="olive" className="px-3 py-1 text-xs">
            System Status: 100% Operational
          </Badge>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Buyers</CardTitle>
            <div className="p-2 rounded-lg bg-agro-forest/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">1,245</div>
            <p className="text-xs text-tertiary font-medium mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certified Farmers</CardTitle>
            <div className="p-2 rounded-lg bg-agro-olive/15 text-tertiary">
              <Truck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">342 Clusters</div>
            <p className="text-xs text-tertiary font-medium mt-1">+4% harvest enrollment</p>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Orders</CardTitle>
            <div className="p-2 rounded-lg bg-agro-clay/15 text-agro-clay">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">89</div>
            <p className="text-xs text-muted-foreground mt-1">4 packhouse allocations pending</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vessel Shipments</CardTitle>
            <div className="p-2 rounded-lg bg-agro-wheat/20 text-agro-wheat">
              <Anchor className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">42 Containers</div>
            <p className="text-xs text-tertiary font-medium mt-1">All cold reefers within range</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-soft bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base font-heading font-bold text-foreground">Export Metric Volume (MT)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly tonnage across APEDA verified trade lanes</p>
            </div>
            <Badge variant="outline">2026 Season</Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#26462F" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#586C3C" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}T`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E3DCD2', backgroundColor: '#FCFBF9', boxShadow: '0 4px 14px rgba(30,40,30,0.08)' }}
                    itemStyle={{ color: '#1C261F', fontWeight: 600 }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE5DC" />
                  <Area type="monotone" dataKey="revenue" stroke="#26462F" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Health & RBAC Policy */}
        <Card className="lg:col-span-1 border-border shadow-soft bg-card flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-heading font-bold text-foreground">Infrastructure Health</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time subsystem telemetry</p>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-agro-forest/10 text-primary rounded-lg">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">API Gateway & RBAC</p>
                    <p className="text-xs text-muted-foreground">Admin Governed</p>
                  </div>
                </div>
                <Badge variant="olive">Enforced</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-agro-olive/15 text-tertiary rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">QC Grading Service</p>
                    <p className="text-xs text-muted-foreground">Queue size: 0 batches</p>
                  </div>
                </div>
                <Badge variant="olive">Optimal</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-agro-wheat/20 text-agro-wheat rounded-lg">
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Cold Storage Capacity</p>
                    <p className="text-xs text-muted-foreground">Occupancy: 84%</p>
                  </div>
                </div>
                <Badge variant="wheat">84% Full</Badge>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>PostgreSQL + Redis Cache</span>
              <span className="font-semibold text-primary">Connected</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Assignment Governance Banner */}
      <Card className="border-border shadow-soft bg-card overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-foreground">
                Role Governance & Administrative Assignment
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                All platform roles (Admin, Operations Manager, QC Inspector, Logistics Officer, Buyer) are strictly assigned by Administrators. Self-assignment or unauthorized role escalation is blocked at the gateway level.
              </p>
            </div>
          </div>

          <Link to="/admin/users">
            <Button size="sm" className="gap-2 font-semibold shadow-sm whitespace-nowrap">
              Manage Users & Assign Roles <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Live System Activity Stream (Admin Observability / Watchdog) */}
      <Card className="border-border shadow-soft bg-card overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6 flex flex-row items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base font-heading font-bold text-foreground">
                Real-Time System Watchdog & Audit Stream
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admin visibility feed: monitoring all authentication, role updates, pricing fixes, and order transitions.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoadingLogs} className="gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            Refresh Feed
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No recent audit logs available or all systems quiescent.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-6">Timestamp</th>
                    <th className="py-2.5 px-6">Actor / Operator</th>
                    <th className="py-2.5 px-6">Action Executed</th>
                    <th className="py-2.5 px-6">Resource</th>
                    <th className="py-2.5 px-6">Metadata Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 font-mono">
                      <td className="py-3 px-6 text-muted-foreground text-[11px]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                      </td>
                      <td className="py-3 px-6 font-semibold text-foreground">
                        {log.actor}
                      </td>
                      <td className="py-3 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-muted-foreground">
                        {log.resourceType || 'SYSTEM'} {log.resourceId ? `(${log.resourceId.slice(0, 8)}...)` : ''}
                      </td>
                      <td className="py-3 px-6 text-foreground text-[11px] font-sans max-w-xs truncate">
                        {log.metadata || 'Standard system execution'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
