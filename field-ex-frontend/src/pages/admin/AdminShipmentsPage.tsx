import { useState, useEffect, useCallback } from 'react';
import { Ship, Plus, RefreshCw, Edit2, CheckCircle2, AlertCircle, X, Anchor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

const SHIPMENT_NEXT: Record<string, string[]> = {
  PREPARING: ['PACKED', 'CANCELLED'],
  PACKED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['IN_TRANSIT'],
  IN_TRANSIT: ['CUSTOMS', 'DELAYED'],
  DELAYED: ['IN_TRANSIT'],
  CUSTOMS: ['DELAYED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [createOrderId, setCreateOrderId] = useState('');
  const [initModalOpen, setInitModalOpen] = useState(false);
  const [editShipment, setEditShipment] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editForm, setEditForm] = useState({
    shippingCompany: '',
    containerNumber: '',
    trackingNumber: '',
    originPort: '',
    destinationPort: '',
    destinationCountry: '',
  });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [shipRes, ordRes] = await Promise.all([
        adminApi.getShipments(),
        adminApi.getAllOrders({ size: 100 }),
      ]);
      setShipments(shipRes.content || (Array.isArray(shipRes) ? shipRes : []));
      setOrders(ordRes.content || (Array.isArray(ordRes) ? ordRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load shipments.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchData(false); }, 0);
    const timer = setInterval(() => {
      if (!initModalOpen && !editShipment) void fetchData(true);
    }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchData, initModalOpen, editShipment]);

  const handleInitShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createShipmentForOrder(createOrderId);
      setInitModalOpen(false);
      setMessage({ type: 'success', text: 'Shipment initialized and linked to order.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to initialize shipment.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShipment) return;
    try {
      setSubmitting(true);
      await adminApi.updateShipmentDetails(editShipment.id, editForm);
      setEditShipment(null);
      setMessage({ type: 'success', text: 'Carrier & container details updated cleanly.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update carrier details.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (s: any, nextStatus: string) => {
    try {
      await adminApi.updateShipmentStatus(s.id, nextStatus, `Logistics transition to ${nextStatus}`);
      setMessage({ type: 'success', text: `Shipment for ${s.orderNumber} updated to ${nextStatus}.` });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Shipment status transition blocked by precondition.' });
    }
  };

  const existingOrderIds = new Set(shipments.map((s) => s.orderId));
  const ordersWithoutShipment = orders.filter(
    (o) => !existingOrderIds.has(o.id) && ['PROCESSING', 'PAID', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'CUSTOMS'].includes(o.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Ship className="w-3.5 h-3.5" />
              <span>Reefer Ocean & Air Freight</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Export Shipments & Vessel Tracking</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Auto-created on order acceptance. Assign vessels, containers, B/L tracking; final DELIVERED state is confirmed by the Buyer.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {ordersWithoutShipment.length > 0 && (
            <Button size="sm" onClick={() => setInitModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Initialize Shipment
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${message.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <Card className="border-border shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6">
          <CardTitle className="text-base font-heading font-bold">Active Logistics Shipments ({shipments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live shipments...</div>
          ) : shipments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No active shipments yet. Accept an order to initialize its shipment automatically.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Order #</th>
                    <th className="py-3 px-5">Carrier & Container</th>
                    <th className="py-3 px-5">Route (Origin → Dest)</th>
                    <th className="py-3 px-5">ETA</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {shipments.map((s) => {
                    const nextOpts = SHIPMENT_NEXT[s.status] || [];
                    return (
                      <tr key={s.id} className="hover:bg-muted/20">
                        <td className="py-3.5 px-5 font-mono font-bold text-primary">{s.orderNumber}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-foreground">{s.shippingCompany || 'Carrier Pending'}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {s.containerNumber || 'Container TBD'} • {s.trackingNumber || 'Track TBD'}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1 font-medium text-foreground">
                            <Anchor className="w-3.5 h-3.5 text-tertiary" />
                            <span>{s.originPort || 'JNPT Mumbai'} → {s.destinationPort || 'Destination'}</span>
                          </div>
                          <div className="text-muted-foreground">Country: {s.destinationCountry || 'GB'}</div>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-muted-foreground">
                          {s.actualDelivery
                            ? `Delivered ${new Date(s.actualDelivery).toLocaleDateString()}`
                            : s.expectedDelivery
                              ? new Date(s.expectedDelivery).toLocaleDateString()
                              : 'TBD'}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{s.status}</Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                setEditShipment(s);
                                setEditForm({
                                  shippingCompany: s.shippingCompany || '',
                                  containerNumber: s.containerNumber || '',
                                  trackingNumber: s.trackingNumber || '',
                                  originPort: s.originPort || 'JNPT Port, Mumbai',
                                  destinationPort: s.destinationPort || '',
                                  destinationCountry: s.destinationCountry || 'GB',
                                });
                              }}
                            >
                              <Edit2 className="w-3 h-3" /> Edit Freight
                            </Button>
                            {nextOpts.length > 0 && (
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleTransition(s, nextOpts[0])}>
                                → {nextOpts[0]}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {initModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Initialize Shipment for Order</h3>
              <button onClick={() => setInitModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleInitShipment} className="space-y-4 mt-4">
              <select required value={createOrderId} onChange={(e) => setCreateOrderId(e.target.value)} className="w-full text-xs bg-background border border-border rounded-md p-2">
                <option value="">Select accepted order...</option>
                {ordersWithoutShipment.map((o) => (
                  <option key={o.id} value={o.id}>{o.orderNumber} ({o.status})</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setInitModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Shipment'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editShipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Update Freight: {editShipment.orderNumber}</h3>
              <button onClick={() => setEditShipment(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveDetails} className="space-y-3 mt-4">
              <Input placeholder="Shipping Line / Vessel (e.g. CMA CGM)" value={editForm.shippingCompany} onChange={(e) => setEditForm({ ...editForm, shippingCompany: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Container # (CMAU...)" value={editForm.containerNumber} onChange={(e) => setEditForm({ ...editForm, containerNumber: e.target.value })} />
                <Input placeholder="Tracking / B/L #" value={editForm.trackingNumber} onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Origin Port" value={editForm.originPort} onChange={(e) => setEditForm({ ...editForm, originPort: e.target.value })} />
                <Input placeholder="Destination Port" value={editForm.destinationPort} onChange={(e) => setEditForm({ ...editForm, destinationPort: e.target.value })} />
              </div>
              <Input maxLength={2} placeholder="ISO Destination Country (e.g. GB, NL)" value={editForm.destinationCountry} onChange={(e) => setEditForm({ ...editForm, destinationCountry: e.target.value.toUpperCase() })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditShipment(null)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Freight Details'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
