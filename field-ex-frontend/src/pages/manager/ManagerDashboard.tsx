import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  FileText, ShieldCheck, Ship, DollarSign, 
  Clock, CheckCircle2, AlertCircle, ArrowUpRight, 
  Sparkles, Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const revenuePipelineData = [
  { month: 'Jun', confirmed: 142000, inTransit: 98000 },
  { month: 'Jul', confirmed: 185000, inTransit: 112000 },
  { month: 'Aug', confirmed: 198000, inTransit: 145000 },
  { month: 'Sep', confirmed: 234000, inTransit: 168000 },
  { month: 'Oct', confirmed: 289000, inTransit: 210000 },
  { month: 'Nov', confirmed: 345000, inTransit: 260000 },
];

const pendingAuthorizations = [
  { id: 'ORD-2026-8812', buyer: 'Global Fresh Imports Ltd (UK)', fruit: 'Alphonso Mango', amount: '$42,500', status: 'PAYMENT_PENDING', action: 'Approve Payment' },
  { id: 'ORD-2026-8819', buyer: 'Emirates Agrico FZE (UAE)', fruit: 'Bhagwa Pomegranate', amount: '$68,200', status: 'PROCESSING', action: 'Release to Packing' },
  { id: 'ORD-2026-8824', buyer: 'Rotterdam EuroFruit B.V.', fruit: 'Grand Naine Banana', amount: '$31,900', status: 'CUSTOMS', action: 'Verify Clearance' },
  { id: 'ORD-2026-8831', buyer: 'Singapore Agro Traders', fruit: 'Kesar Mango', amount: '$54,000', status: 'PACKED', action: 'Dispatch Reefer' },
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Sparkles className="w-3 h-3 text-tertiary" />
            <span>Operations Management & Oversight</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Manager Control Hub</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Operational pipeline governance, order lifecycle approvals, fulfillment speed, and trade metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="olive" className="px-3 py-1 text-xs">
            Role: Operations Manager
          </Badge>
          <Button size="sm" className="shadow-sm">
            Generate Operations Dossier
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Volume (Active)</CardTitle>
            <div className="p-2 rounded-lg bg-agro-forest/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">74 Shipments</div>
            <p className="text-xs text-tertiary font-medium mt-1">12 awaiting payment or dispatch approval</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pipeline Value</CardTitle>
            <div className="p-2 rounded-lg bg-agro-olive/15 text-tertiary">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">$1,280,000</div>
            <p className="text-xs text-tertiary font-medium mt-1">+18.4% compared to prior quarter</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">QC Pass Yield</CardTitle>
            <div className="p-2 rounded-lg bg-agro-clay/15 text-agro-clay">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">98.6%</div>
            <p className="text-xs text-muted-foreground mt-1">Export Grade A compliant across all packhouses</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cold-Chain SLA</CardTitle>
            <div className="p-2 rounded-lg bg-agro-wheat/20 text-agro-wheat">
              <Ship className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">99.4%</div>
            <p className="text-xs text-tertiary font-medium mt-1">Reefer temperature within ±0.4°C limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-soft bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base font-heading font-bold text-foreground">Fulfillment Velocity & Value Flow</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Confirmed export orders vs In-Transit ocean container freight</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="wheat" className="text-[10px]">Monthly Telemetry</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenuePipelineData}>
                  <defs>
                    <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4A7C59" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorTransit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A373" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#D4A373" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }} 
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="confirmed" name="Confirmed Orders" stroke="#4A7C59" strokeWidth={2} fillOpacity={1} fill="url(#colorConfirmed)" />
                  <Area type="monotone" dataKey="inTransit" name="In Transit Reefer" stroke="#D4A373" strokeWidth={2} fillOpacity={1} fill="url(#colorTransit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Manager Operational Priorities */}
        <Card className="border-border shadow-soft bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-heading font-bold text-foreground">Operational Priorities</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Critical checkpoints requiring manager sign-off</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-accent/50 border border-border flex items-start gap-3">
              <div className="p-2 rounded-lg bg-agro-forest/15 text-primary mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-foreground">Rotterdam Sea Freight Clearance</p>
                <p className="text-muted-foreground mt-0.5">Container #MSCU-90234 customs dossier validated by port agents.</p>
                <span className="inline-block mt-2 font-semibold text-primary cursor-pointer hover:underline">
                  Finalize Clearance →
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/50 border border-border flex items-start gap-3">
              <div className="p-2 rounded-lg bg-agro-wheat/20 text-agro-ochre mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-foreground">Cold Hub Inventory Allocation</p>
                <p className="text-muted-foreground mt-0.5">18,000 kg Alphonso harvest awaiting warehouse bay assignment.</p>
                <span className="inline-block mt-2 font-semibold text-primary cursor-pointer hover:underline">
                  Assign Storage Bays →
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/50 border border-border flex items-start gap-3">
              <div className="p-2 rounded-lg bg-agro-clay/15 text-agro-clay mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-foreground">Quotation Review Queue</p>
                <p className="text-muted-foreground mt-0.5">3 high-volume procurement quotes awaiting freight margin verification.</p>
                <span className="inline-block mt-2 font-semibold text-primary cursor-pointer hover:underline">
                  Review Quotations →
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Awaiting Lifecycle Transition */}
      <Card className="border-border shadow-soft bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-heading font-bold text-foreground">Active Order Lifecycle Queue</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Orders in state machine pipeline requiring operational management</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            <Filter className="w-3.5 h-3.5 mr-1" /> View All Orders
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Buyer / Destination</th>
                  <th className="py-3 px-4">Produce Line</th>
                  <th className="py-3 px-4">Invoice Value</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingAuthorizations.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-foreground">{ord.id}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{ord.buyer}</td>
                    <td className="py-3 px-4 text-muted-foreground">{ord.fruit}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{ord.amount}</td>
                    <td className="py-3 px-4">
                      <Badge variant="forest" className="text-[10px] uppercase">
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs font-medium">
                        {ord.action} <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
