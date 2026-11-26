import { useState, useEffect, useCallback } from 'react';
import { BarChart, RefreshCw, DollarSign, ShieldCheck, Ship, PackageSearch, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOverview = useCallback(async (silent = false) => {
    try {
      const res = await adminApi.getAnalyticsOverview();
      setData(res);
      setErrorMessage(null);
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setErrorMessage(err.response?.data?.message || 'Failed to load real-time analytics.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchOverview(false); }, 0);
    const timer = setInterval(() => { void fetchOverview(true); }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchOverview]);

  const orderStatusEntries = Object.entries(data?.ordersByStatus || {}) as [string, number][];
  const shipmentStatusEntries = Object.entries(data?.shipmentsByStatus || {}) as [string, number][];
  const topProduce = data?.topProduceVolumes || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <BarChart className="w-3.5 h-3.5" />
              <span>PostgreSQL Telemetry</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Aggregation ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Executive Export Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live order pipeline value, buyer-confirmed delivered revenue, QC pass ratios, and commodity volume mix.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchOverview(false); }}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{errorMessage}</div>
      )}

      {isLoading && !data ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Computing real-time database metrics...</div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase">
                  <span>Active Order Pipeline</span>
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-2">
                  USD ${Number(data.totalOrderValue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.activeOrders} active • {data.deliveredOrders} buyer-confirmed delivered
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase">
                  <span>Confirmed Delivered Revenue</span>
                  <Ship className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-mono font-extrabold text-emerald-700 mt-2">
                  USD ${Number(data.deliveredRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.inTransitShipments} active shipments • {data.pendingQuotations} open quotes
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase">
                  <span>QC Approval Rate</span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-2">{Number(data.qcPassRatePercent || 0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.approvedInspections} / {data.totalInspections} inspections passed
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase">
                  <span>Cold Inventory & Alerts</span>
                  <PackageSearch className="w-4 h-4 text-tertiary" />
                </div>
                <p className="text-2xl font-mono font-extrabold text-foreground mt-2">
                  {Number(data.availableInventoryKg || 0).toLocaleString()} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  {data.coldChainExcursions} excursions • {data.totalWarehouses} facilities
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border shadow-soft">
              <CardHeader className="border-b border-border py-4 px-6">
                <CardTitle className="text-base font-heading font-bold">Orders & Shipments Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Commercial Orders by Stage</h4>
                  <div className="space-y-2">
                    {orderStatusEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No order data.</p>
                    ) : orderStatusEntries.map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 border border-border">
                        <Badge variant="outline">{status}</Badge>
                        <span className="font-mono font-bold text-foreground">{count} order(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Logistics Shipments by Stage</h4>
                  <div className="space-y-2">
                    {shipmentStatusEntries.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No shipment data.</p>
                    ) : shipmentStatusEntries.map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 border border-border">
                        <Badge variant="outline">{status}</Badge>
                        <span className="font-mono font-bold text-foreground">{count} shipment(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft">
              <CardHeader className="border-b border-border py-4 px-6">
                <CardTitle className="text-base font-heading font-bold">Top Produce Export Volumes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {topProduce.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No ordered commodity data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topProduce.map((item: any) => (
                      <div key={item.fruitName} className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm text-foreground">{item.fruitName}</div>
                          <div className="text-xs text-muted-foreground">
                            {Number(item.totalQuantityKg || 0).toLocaleString()} kg ({(Number(item.totalQuantityKg || 0) / 1000).toFixed(2)} MT)
                          </div>
                        </div>
                        <div className="font-mono font-bold text-sm text-primary">
                          USD ${Number(item.totalValueUsd || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
