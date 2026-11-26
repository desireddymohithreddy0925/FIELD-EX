import { useState, useEffect, useCallback } from 'react';
import { Box, Plus, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

const BATCH_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['IN_COLD_STORAGE', 'PACKAGED', 'CANCELLED'],
  IN_COLD_STORAGE: ['PACKAGED', 'EXPIRED', 'CANCELLED'],
  PACKAGED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    qualityInspectionId: '',
    approvedQuantity: 1000,
    warehouseId: '',
  });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [batchRes, qcRes, whRes] = await Promise.all([
        adminApi.getBatches(),
        adminApi.getQualityInspections(),
        adminApi.getWarehouses(),
      ]);
      setBatches(batchRes.content || (Array.isArray(batchRes) ? batchRes : []));
      setInspections(qcRes.content || (Array.isArray(qcRes) ? qcRes : []));
      setWarehouses(whRes.content || (Array.isArray(whRes) ? whRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load fruit batches.' });
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
      await adminApi.createBatch({
        qualityInspectionId: form.qualityInspectionId,
        approvedQuantity: Number(form.approvedQuantity),
        warehouseId: form.warehouseId,
        packingDate: new Date().toISOString(),
      });
      setModalOpen(false);
      setMessage({ type: 'success', text: 'Fruit batch registered cleanly with cold-storage traceability.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create fruit batch.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (batch: any, nextStatus: string) => {
    try {
      await adminApi.updateBatchStatus(batch.id, nextStatus, `Transitioned to ${nextStatus}`);
      setMessage({ type: 'success', text: `Batch ${batch.batchNumber} updated to ${nextStatus}.` });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to transition batch status.' });
    }
  };

  const eligibleInspections = inspections.filter((q) => q.status === 'PASSED' || q.status === 'PARTIALLY_PASSED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Box className="w-3.5 h-3.5" />
              <span>Lot Traceability</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Fruit Batches & Lot Traceability</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live QC-approved export batches linked to suppliers, shelf-life expiration, and cold warehouses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Register Batch
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
          <CardTitle className="text-base font-heading font-bold">Active Traceable Fruit Batches ({batches.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live fruit batches...</div>
          ) : batches.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No batches registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Batch #</th>
                    <th className="py-3 px-5">Fruit & Variety</th>
                    <th className="py-3 px-5">Supplier & Warehouse</th>
                    <th className="py-3 px-5">Approved Qty / Grade</th>
                    <th className="py-3 px-5">Expiration</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {batches.map((b) => {
                    const nextOpts = BATCH_TRANSITIONS[b.status] || [];
                    return (
                      <tr key={b.id} className="hover:bg-muted/20">
                        <td className="py-3.5 px-5 font-mono font-bold text-primary">{b.batchNumber}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-foreground">{b.fruitName}</div>
                          <div className="text-muted-foreground">{b.varietyName}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-medium text-foreground">{b.supplierName || '-'}</div>
                          <div className="text-muted-foreground">{b.warehouseName || '-'}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-foreground">{Number(b.approvedQuantity || 0).toLocaleString()} kg</div>
                          <Badge variant="outline" className="text-[10px] mt-0.5">{b.qualityGrade || 'GRADE_A'}</Badge>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-muted-foreground">
                          {b.expirationDate ? new Date(b.expirationDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{b.status}</Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {nextOpts.length > 0 ? (
                            <div className="inline-flex gap-1.5">
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(b, nextOpts[0])}>
                                → {nextOpts[0]}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Terminal</span>
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Register Traceable Fruit Batch</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Passed QC Inspection</label>
                <select
                  required
                  value={form.qualityInspectionId}
                  onChange={(e) => setForm({ ...form, qualityInspectionId: e.target.value })}
                  className="w-full text-xs bg-background border border-border rounded-md p-2"
                >
                  <option value="">Select passed QC inspection...</option>
                  {eligibleInspections.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.inspectionNumber} ({q.grade} • Accepted {q.acceptedQuantity} kg)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Assigned Warehouse</label>
                <select
                  required
                  value={form.warehouseId}
                  onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                  className="w-full text-xs bg-background border border-border rounded-md p-2"
                >
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Approved Batch Quantity (kg)</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={form.approvedQuantity}
                  onChange={(e) => setForm({ ...form, approvedQuantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Batch'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
