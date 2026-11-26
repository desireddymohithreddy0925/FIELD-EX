import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Ship, Loader2, ArrowRight, Anchor, Calendar } from 'lucide-react';

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = useCallback(async (silent = false) => {
    try {
      const data = await buyerApi.getMyShipments();
      setShipments(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      if (!silent) console.error('Failed to fetch shipments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      void fetchShipments(false);
    }, 0);
    const timer = setInterval(() => {
      void fetchShipments(true);
    }, 4000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [fetchShipments]);

  const handleRefresh = () => {
    setLoading(true);
    void fetchShipments(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="olive">Delivered</Badge>;
      case 'IN_TRANSIT':
        return <Badge variant="wheat">In Transit</Badge>;
      case 'DISPATCHED':
        return <Badge variant="outline" className="border-primary text-primary">Dispatched</Badge>;
      case 'CUSTOMS':
        return <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">Customs Clearance</Badge>;
      case 'PACKED':
      case 'PREPARING':
        return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Preparing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Fetching active sea & air freight manifests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Anchor className="w-3 h-3 text-tertiary" />
            <span>End-to-End Cold Chain Freight</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Consignment Shipments</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Real-time intermodal tracking, container telematics, and port departures.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} size="sm">
          Refresh Shipments
        </Button>
      </div>

      {shipments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shipments.map((s) => (
            <Card key={s.id} className="border-border hover:shadow-card transition-all">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
                      <Ship className="w-4 h-4 text-primary" />
                      <span>Order #{s.orderNumber || s.orderId?.slice(0, 8)}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Carrier: {s.shippingCompany || 'Field-Ex Global Logistics'}
                    </p>
                  </div>
                  {getStatusBadge(s.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Origin Port:</span>
                    <p className="font-semibold text-foreground mt-0.5">{s.originPort || 'JNPT Port, Mumbai'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Destination:</span>
                    <p className="font-semibold text-foreground mt-0.5">{s.destinationPort || s.destinationCountry || 'International Port'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Container Number:</span>
                    <p className="font-mono text-foreground mt-0.5">{s.containerNumber || 'REEFER-PENDING'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <p className="font-mono text-foreground mt-0.5">{s.trackingNumber || 'TRK-' + s.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ETA: {s.expectedDelivery ? new Date(s.expectedDelivery).toLocaleDateString() : 'Pending confirmation'}</span>
                  </div>
                  {s.orderId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-semibold text-primary hover:text-secondary gap-1 p-0 h-auto"
                      onClick={() => navigate(`/buyer/orders/${s.orderId}`)}
                    >
                      View Order <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Ship className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-heading font-semibold text-foreground">No Active Shipments Yet</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Once your accepted quotation transitions into a confirmed export order and container loading starts, full telematics and tracking will be visible here.
            </p>
            <Button
              variant="default"
              className="mt-6 bg-primary hover:bg-secondary text-primary-foreground"
              onClick={() => navigate('/buyer/quotations')}
            >
              Check Quotations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
