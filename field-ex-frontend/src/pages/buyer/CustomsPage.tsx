import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ClipboardCheck, Loader2, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';

export default function CustomsPage() {
  const navigate = useNavigate();
  const [customsShipments, setCustomsShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomsData();
  }, []);

  const fetchCustomsData = async () => {
    try {
      setLoading(true);
      const shipments = await buyerApi.getMyShipments();
      const list = Array.isArray(shipments) ? shipments : [];
      // Filter shipments that are in customs or recently cleared
      const filtered = list.filter((s: any) => 
        s.status === 'CUSTOMS' || s.status === 'IN_TRANSIT' || s.status === 'DELIVERED'
      );
      setCustomsShipments(filtered);
    } catch (err) {
      console.error('Failed to load customs data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Retrieving port customs clearance status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <ShieldCheck className="w-3 h-3 text-tertiary" />
            <span>Port of Entry & Border Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Customs Clearance</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Single-window international trade compliance, phytosanitary clearance, and duty manifests.
          </p>
        </div>
        <Button variant="outline" onClick={fetchCustomsData} size="sm">
          Refresh Customs
        </Button>
      </div>

      {customsShipments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customsShipments.map((s) => (
            <Card key={s.id} className="border-border hover:shadow-card transition-all">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-heading font-bold">
                      Consignment #{s.orderNumber || s.orderId?.slice(0, 8)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Destination: {s.destinationPort || s.destinationCountry || 'Customs Port'}
                    </p>
                  </div>
                  {s.status === 'CUSTOMS' ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                      Under Inspection
                    </Badge>
                  ) : (
                    <Badge variant="olive">Cleared for Entry</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Carrier / Vessel:</span>
                    <p className="font-semibold text-foreground mt-0.5">{s.shippingCompany || 'Field-Ex Global'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Container Number:</span>
                    <p className="font-mono text-foreground mt-0.5">{s.containerNumber || 'Assigned'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Phytosanitary inspection & export Bill of Lading filed with customs authorities.</span>
                </div>

                {s.orderId && (
                  <div className="pt-2 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-semibold text-primary hover:text-secondary gap-1 p-0 h-auto"
                      onClick={() => navigate(`/buyer/orders/${s.orderId}`)}
                    >
                      View Order Manifest <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardCheck className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-heading font-semibold text-foreground">No Pending Customs Clearances</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Any required import documentation, duty verification, or phytosanitary releases for shipments in transit will appear here automatically.
            </p>
            <Button 
              variant="default" 
              className="mt-6 bg-primary hover:bg-secondary text-primary-foreground"
              onClick={() => navigate('/buyer/orders')}
            >
              View Active Orders
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
