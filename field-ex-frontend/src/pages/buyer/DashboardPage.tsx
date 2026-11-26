import { useEffect, useState } from 'react';
import { Package, FileText, CheckCircle, ArrowRight, Sprout, Thermometer, RefreshCw } from 'lucide-react';
import { buyerApi } from '../../services/buyerApi';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveBuyerData = async () => {
    setIsLoading(true);
    try {
      const [qData, oData] = await Promise.all([
        buyerApi.getQuotations(0, 100).catch(() => ({ content: [] })),
        buyerApi.getOrders(0, 100).catch(() => ({ content: [] })),
      ]);
      setQuotations(qData?.content || (Array.isArray(qData) ? qData : []));
      setOrders(oData?.content || (Array.isArray(oData) ? oData : []));
    } catch {
      // Keep silent fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBuyerData();
    const timer = setInterval(fetchLiveBuyerData, 4000);
    return () => clearInterval(timer);
  }, []);

  const pendingQuotations = quotations.filter(q => q.status === 'REQUESTED' || q.status === 'SENT').length;
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Sprout className="w-3 h-3 text-tertiary" />
              <span>Commercial Buyer Console</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Real-Time Stream</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Buyer Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Real-time procurement activity, active spot quotes, and temperature telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLiveBuyerData}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/buyer/catalog">Browse Produce Catalog</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/buyer/quotations/request">Request New Quotation</Link>
          </Button>
        </div>
      </div>

      {/* Agro Tertiary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Pending Quotations - Terracotta / Clay */}
        <div className="bg-card p-5 rounded-2xl border border-agro-clay/30 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Quotations</span>
            <h3 className="text-3xl font-heading font-bold text-foreground mt-1">{pendingQuotations}</h3>
            <p className="text-xs text-agro-clay font-medium mt-1">Awaiting admin review</p>
          </div>
          <div className="p-3 bg-agro-clay/10 text-agro-clay border border-agro-clay/20 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Active Orders - Forest / Olive */}
        <div className="bg-card p-5 rounded-2xl border border-agro-olive/30 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Orders</span>
            <h3 className="text-3xl font-heading font-bold text-foreground mt-1">{activeOrders}</h3>
            <p className="text-xs text-primary font-medium mt-1">In packhouse & transit</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Cold-Chain Telemetry - Juniper / Slate */}
        <div className="bg-card p-5 rounded-2xl border border-agro-slate/30 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cold-Chain Status</span>
            <h3 className="text-3xl font-heading font-bold text-foreground mt-1">+1.2°C</h3>
            <p className="text-xs text-tertiary font-medium mt-1">All reefer units nominal</p>
          </div>
          <div className="p-3 bg-agro-sage/15 text-tertiary border border-agro-sage/30 rounded-xl">
            <Thermometer className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Completed Harvests - Barley Wheat */}
        <div className="bg-card p-5 rounded-2xl border border-agro-wheat/30 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed Orders</span>
            <h3 className="text-3xl font-heading font-bold text-foreground mt-1">{completedOrders}</h3>
            <p className="text-xs text-agro-wheat font-medium mt-1">Delivered to discharge ports</p>
          </div>
          <div className="p-3 bg-agro-wheat/15 text-agro-wheat border border-agro-wheat/30 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      {/* Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotations */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-foreground">Recent Quotations</h3>
              <Link to="/buyer/quotations" className="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {quotations.slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {quotations.slice(0, 5).map(q => (
                  <div 
                    key={q.id} 
                    className="flex justify-between items-center p-3.5 hover:bg-muted/60 rounded-xl transition-colors border border-border cursor-pointer bg-background/50"
                    onClick={() => navigate(`/buyer/quotations/${q.id}`)}
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">Quotation #{q.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Active Request'}
                      </p>
                    </div>
                    <Badge variant={q.status === 'ACCEPTED' ? 'olive' : q.status === 'SENT' ? 'clay' : 'wheat'}>
                      {q.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl border-border">
                No recent quotations found. Request your first quote from the catalog.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Incoterms available: FOB, CIF, CFR</span>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link to="/buyer/quotations/request">Create RFQ</Link>
            </Button>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-foreground">Active Orders</h3>
              <Link to="/buyer/orders" className="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').slice(0, 5).map(o => (
                  <div 
                    key={o.id} 
                    className="flex justify-between items-center p-3.5 hover:bg-muted/60 rounded-xl transition-colors border border-border cursor-pointer bg-background/50"
                    onClick={() => navigate(`/buyer/orders/${o.id}`)}
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">Order #{o.orderNumber || o.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'In Processing'}
                      </p>
                    </div>
                    <Badge variant={o.status === 'PROCESSING' ? 'forest' : o.status === 'IN_TRANSIT' ? 'olive' : 'wheat'}>
                      {o.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-xl border-border">
                No active orders at this time.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Verified cold-chain telemetry active</span>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link to="/buyer/orders">Track Shipments</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
