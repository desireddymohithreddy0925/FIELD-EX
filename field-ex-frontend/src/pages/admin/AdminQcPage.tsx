import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminQcPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [procurementOrders, setProcurementOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    procurementItemId: '',
    inspectedQuantity: 1000,
    acceptedQuantity: 980,
    rejectedQuantity: 20,
    grade: 'GRADE_A',
    visualQuality: 'Uniform color, export clean skin',
    phytosanitaryStatus: 'PASS - Zero quarantine pests',
    notes: '',
  });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [qcRes, procRes] = await Promise.all([
        adminApi.getQualityInspections(),
        adminApi.getProcurementOrders(),
      ]);
      setInspections(qcRes.content || (Array.isArray(qcRes) ? qcRes : []));
      setProcurementOrders(procRes.content || (Array.isArray(procRes) ? procRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load QC inspections.' });
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

  const allProcItems = procurementOrders.flatMap((po) =>
    (po.items || []).map((it: any) => ({
      id: it.id,
      label: `${po.orderNumber} — ${it.fruitName} (${it.varietyName}) • ${Number(it.quantity).toLocaleString()} kg`,
      quantity: Number(it.quantity),
    }))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createQualityInspection({
        procurementItemId: form.procurementItemId,
        inspectedQuantity: Number(form.inspectedQuantity),
        acceptedQuantity: Number(form.acceptedQuantity),
        rejectedQuantity: Number(form.rejectedQuantity),
        grade: form.grade,
        visualQuality: form.visualQuality,
        phytosanitaryStatus: form.phytosanitaryStatus,
        notes: form.notes,
      });
      setModalOpen(false);
      setMessage({ type: 'success', text: 'QC inspection logged in real time.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create QC inspection.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ins: any, status: string) => {
    try {
      await adminApi.updateQualityStatus(ins.id, status, `QC ${status} sign-off`);
      setMessage({ type: 'success', text: `Inspection ${ins.inspectionNumber} marked ${status}.` });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update inspection status.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Export Quality Control</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Quality Control & Phytosanitary Inspections</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Brix checks, defect tolerances, grading certificates, and inspector sign-offs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Log QC Inspection
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
          <CardTitle className="text-base font-heading font-bold">QC Inspections ({inspections.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live QC inspections...</div>
          ) : inspections.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No quality inspections logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Inspection #</th>
                    <th className="py-3 px-5">Inspector</th>
                    <th className="py-3 px-5">Inspected / Accepted / Rejected</th>
                    <th className="py-3 px-5">Grade & Phytosanitary</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {inspections.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5 font-mono font-bold text-primary">{q.inspectionNumber}</td>
                      <td className="py-3.5 px-5">{q.inspectorName || 'QC Desk'}</td>
                      <td className="py-3.5 px-5 font-mono">
                        <span>{Number(q.inspectedQuantity || 0).toLocaleString()} kg</span> •{' '}
                        <span className="text-emerald-700 font-bold">{Number(q.acceptedQuantity || 0).toLocaleString()} pass</span> •{' '}
                        <span className="text-rose-700">{Number(q.rejectedQuantity || 0).toLocaleString()} rej</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className="mr-1.5">{q.grade || 'GRADE_A'}</Badge>
                        <span className="text-muted-foreground">{q.phytosanitaryStatus || q.visualQuality || '-'}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className={q.status === 'PASSED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : q.status === 'FAILED' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}>
                          {q.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {q.status === 'PENDING' || q.status === 'REQUIRES_REINSPECTION' ? (
                          <div className="inline-flex gap-1.5">
                            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange(q, 'PASSED')}>Pass</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs text-rose-700 border-rose-300" onClick={() => handleStatusChange(q, 'FAILED')}>Fail</Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Completed</span>
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Record QC Inspection</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Procurement Line Item</label>
                <select
                  required
                  value={form.procurementItemId}
                  onChange={(e) => {
                    const found = allProcItems.find((x) => x.id === e.target.value);
                    const qty = found?.quantity || 1000;
                    setForm({ ...form, procurementItemId: e.target.value, inspectedQuantity: qty, acceptedQuantity: qty, rejectedQuantity: 0 });
                  }}
                  className="w-full text-xs bg-background border border-border rounded-md p-2"
                >
                  <option value="">Select procurement item...</option>
                  {allProcItems.map((it) => (<option key={it.id} value={it.id}>{it.label}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Inspected (kg)</label>
                  <Input type="number" min="0" required value={form.inspectedQuantity} onChange={(e) => setForm({ ...form, inspectedQuantity: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Accepted (kg)</label>
                  <Input type="number" min="0" required value={form.acceptedQuantity} onChange={(e) => setForm({ ...form, acceptedQuantity: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Rejected (kg)</label>
                  <Input type="number" min="0" required value={form.rejectedQuantity} onChange={(e) => setForm({ ...form, rejectedQuantity: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Quality Grade</label>
                  <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full h-9 text-xs bg-background border border-border rounded-md px-2">
                    <option value="GRADE_A">GRADE_A (Export Extra)</option>
                    <option value="GRADE_B">GRADE_B (Standard)</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Phytosanitary Status</label>
                  <Input value={form.phytosanitaryStatus} onChange={(e) => setForm({ ...form, phytosanitaryStatus: e.target.value })} />
                </div>
              </div>
              <Input placeholder="Visual & Brix assessment notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Submit Inspection'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
