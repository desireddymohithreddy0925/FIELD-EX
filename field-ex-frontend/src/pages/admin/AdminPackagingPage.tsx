import { useState, useEffect, useCallback } from 'react';
import { Archive, Plus, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminPackagingPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    orderId: '',
    fruitBatchId: '',
    quantity: 1000,
    packagingType: 'Export Ventilated CFB Carton',
    packageCount: 50,
    packageWeight: 20,
    packedBy: 'Packhouse Unit A',
    notes: '',
  });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [pkgRes, ordRes, batchRes] = await Promise.all([
        adminApi.getPackagingRecords(),
        adminApi.getAllOrders({ size: 100 }),
        adminApi.getBatches(),
      ]);
      setRecords(Array.isArray(pkgRes) ? pkgRes : []);
      setOrders(ordRes.content || (Array.isArray(ordRes) ? ordRes : []));
      setBatches(batchRes.content || (Array.isArray(batchRes) ? batchRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load packaging records.' });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createPackagingRecord({
        orderId: form.orderId,
        packingDate: new Date().toISOString(),
        packedBy: form.packedBy,
        notes: form.notes,
        items: [
          {
            fruitBatchId: form.fruitBatchId,
            quantity: Number(form.quantity),
            packagingType: form.packagingType,
            packageCount: Number(form.packageCount),
            packageWeight: Number(form.packageWeight),
            dimensions: '60x40x20 cm',
          },
        ],
      });
      setModalOpen(false);
      setMessage({ type: 'success', text: 'Packaging job created cleanly.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create packaging job.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (record: any, nextStatus: string) => {
    try {
      await adminApi.updatePackagingStatus(record.id, nextStatus, `Packaging updated to ${nextStatus}`);
      setMessage({ type: 'success', text: `Packaging for ${record.orderNumber} updated to ${nextStatus}.` });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update packaging status.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Archive className="w-3.5 h-3.5" />
              <span>Export Packhouse Floor</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Export Packaging & Palletizing</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live carton packing records, allocated FIFO fruit batches, and container staging.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Packaging Job
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
          <CardTitle className="text-base font-heading font-bold">Packhouse Work Orders ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live packaging records...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No packaging jobs logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Order #</th>
                    <th className="py-3 px-5">Packed Lots</th>
                    <th className="py-3 px-5">Packed By / Date</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5 font-mono font-bold text-primary">{r.orderNumber}</td>
                      <td className="py-3.5 px-5">
                        {(r.items || []).map((it: any) => (
                          <div key={it.id} className="text-[11px]">
                            <span className="font-mono font-bold">{it.batchNumber}</span> — {Number(it.quantity).toLocaleString()} kg ({it.packageCount} × {it.packagingType})
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium">{r.packedBy || 'Packhouse Floor'}</div>
                        <div className="text-muted-foreground">{r.packingDate ? new Date(r.packingDate).toLocaleDateString() : '-'}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className={r.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {r.status === 'PENDING' && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleStatusChange(r, 'IN_PROGRESS')}>Start Packing</Button>
                        )}
                        {r.status === 'IN_PROGRESS' && (
                          <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange(r, 'COMPLETED')}>Complete Pack</Button>
                        )}
                        {(r.status === 'COMPLETED' || r.status === 'REJECTED') && (
                          <span className="text-muted-foreground text-[11px]">Finished</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Create Packaging Work Order</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Order (Processing / Allocated)</label>
                <select required value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                  <option value="">Select order...</option>
                  {orders.filter((o) => ['PROCESSING', 'PAID', 'PACKED'].includes(o.status)).map((o) => (
                    <option key={o.id} value={o.id}>{o.orderNumber} ({o.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Allocated Fruit Batch</label>
                <select required value={form.fruitBatchId} onChange={(e) => setForm({ ...form, fruitBatchId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                  <option value="">Select batch...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.batchNumber} — {b.fruitName} ({b.varietyName})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Quantity (kg)</label>
                  <Input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Cartons Count</label>
                  <Input type="number" min="1" required value={form.packageCount} onChange={(e) => setForm({ ...form, packageCount: parseInt(e.target.value, 10) || 1 })} />
                </div>
              </div>
              <Input placeholder="Packaging Type (e.g. Ventilated CFB Carton)" value={form.packagingType} onChange={(e) => setForm({ ...form, packagingType: e.target.value })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Create Job'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
