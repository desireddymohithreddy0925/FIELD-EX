import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';
import { buyerApi } from '../../services/buyerApi';

const NEXT_STATUS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['RECEIVED', 'CANCELLED'],
  REJECTED: [],
  RECEIVED: [],
  CANCELLED: [],
};

export default function AdminProcurementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [fruits, setFruits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    supplierId: '',
    warehouseId: '',
    fruitId: '',
    varietyId: '',
    quantity: 5000,
    unitPrice: 1.8,
    currency: 'USD',
    notes: '',
  });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [procRes, supRes, whRes, fruitRes] = await Promise.all([
        adminApi.getProcurementOrders(),
        adminApi.getSuppliers(),
        adminApi.getWarehouses(),
        buyerApi.getFruits({ page: 0, size: 50 }),
      ]);
      setOrders(procRes.content || (Array.isArray(procRes) ? procRes : []));
      setSuppliers(supRes.content || (Array.isArray(supRes) ? supRes : []));
      setWarehouses(whRes.content || (Array.isArray(whRes) ? whRes : []));
      setFruits(fruitRes.content || (Array.isArray(fruitRes) ? fruitRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load procurement orders.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchData(false); }, 0);
    const timer = setInterval(() => {
      if (!modalOpen) void fetchData(true);
    }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchData, modalOpen]);

  const selectedFruit = fruits.find((f) => f.id === form.fruitId);
  const varieties = selectedFruit?.varieties || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createProcurementOrder({
        supplierId: form.supplierId,
        warehouseId: form.warehouseId,
        purchaseDate: new Date().toISOString(),
        harvestDate: new Date().toISOString(),
        currency: form.currency,
        notes: form.notes,
        items: [
          {
            fruitId: form.fruitId,
            varietyId: form.varietyId,
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
          },
        ],
      });
      setModalOpen(false);
      setMessage({ type: 'success', text: 'Farm procurement order created in real time.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create procurement order.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (order: any, nextStatus: string) => {
    try {
      await adminApi.updateProcurementStatus(order.id, nextStatus, `Status updated to ${nextStatus}`);
      setMessage({ type: 'success', text: `Procurement ${order.orderNumber} updated to ${nextStatus}.` });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update procurement status.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <FileText className="w-3.5 h-3.5" />
              <span>Grower Sourcing & POs</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Farm Procurement Orders</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live orchard purchase orders, farm-gate pricing, and packhouse receiving receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Procurement PO
          </Button>
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
          <CardTitle className="text-base font-heading font-bold">Procurement Ledger ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live procurement POs...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No procurement orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">PO Number</th>
                    <th className="py-3 px-5">Supplier & Warehouse</th>
                    <th className="py-3 px-5">Produce Lots</th>
                    <th className="py-3 px-5">Total Value</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orders.map((po) => {
                    const nextOpts = NEXT_STATUS[po.status] || [];
                    return (
                      <tr key={po.id} className="hover:bg-muted/20">
                        <td className="py-3.5 px-5 font-mono font-bold text-primary">{po.orderNumber}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-foreground">{po.supplierName || '-'}</div>
                          <div className="text-muted-foreground">{po.warehouseName || '-'}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          {(po.items || []).map((it: any) => (
                            <div key={it.id} className="text-[11px]">
                              <span className="font-semibold text-foreground">{it.fruitName}</span> ({it.varietyName}) — {Number(it.quantity).toLocaleString()} kg
                            </div>
                          ))}
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-foreground">
                          {po.currency || 'USD'} {Number(po.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{po.status}</Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {nextOpts.length > 0 ? (
                            <div className="inline-flex gap-1.5">
                              {nextOpts.map((st) => (
                                <Button key={st} size="sm" variant={st === 'REJECTED' || st === 'CANCELLED' ? 'outline' : 'default'} className="h-7 text-xs" onClick={() => handleTransition(po, st)}>
                                  {st}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Finalized</span>
                          )}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Create Procurement PO</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Supplier</label>
                  <select required value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                    <option value="">Select supplier...</option>
                    {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Destination Warehouse</label>
                  <select required value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                    <option value="">Select warehouse...</option>
                    {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Fruit</label>
                  <select required value={form.fruitId} onChange={(e) => setForm({ ...form, fruitId: e.target.value, varietyId: '' })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                    <option value="">Select fruit...</option>
                    {fruits.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Variety</label>
                  <select required disabled={!form.fruitId} value={form.varietyId} onChange={(e) => setForm({ ...form, varietyId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                    <option value="">Select variety...</option>
                    {varieties.map((v: any) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Quantity (kg)</label>
                  <Input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Farm Price / kg</label>
                  <Input type="number" step="0.01" min="0" required value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full h-9 text-xs bg-background border border-border rounded-md px-2">
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <Input placeholder="Harvest notes / lot reference" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create PO'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
