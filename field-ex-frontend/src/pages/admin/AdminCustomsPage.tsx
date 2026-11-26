import { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Plus, RefreshCw, CheckCircle2, AlertCircle, X, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

const CUSTOMS_NEXT: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'INSPECTION'],
  UNDER_REVIEW: ['INSPECTION', 'CLEARED', 'HELD'],
  INSPECTION: ['CLEARED', 'HELD', 'REJECTED'],
  HELD: ['CLEARED', 'REJECTED'],
};

export default function AdminCustomsPage() {
  const [clearances, setClearances] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [initModalOpen, setInitModalOpen] = useState(false);
  const [declareItem, setDeclareItem] = useState<any | null>(null);
  const [initOrderId, setInitOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [decForm, setDecForm] = useState({
    reference: '',
    exportCountry: 'IN',
    destinationCountry: 'GB',
    exportPort: 'JNPT Port, Mumbai',
    destinationPort: 'Port of Felixstowe',
    customsBroker: 'Apex Global Customs Brokers',
    dutiesAndTaxes: 450,
  });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [custRes, ordRes] = await Promise.all([
        adminApi.getAllCustomsClearances(),
        adminApi.getAllOrders({ size: 100 }),
      ]);
      setClearances(Array.isArray(custRes) ? custRes : []);
      setOrders(ordRes.content || (Array.isArray(ordRes) ? ordRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load customs clearances.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchData(false); }, 0);
    const timer = setInterval(() => {
      if (!initModalOpen && !declareItem) void fetchData(true);
    }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchData, initModalOpen, declareItem]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.initiateCustoms(initOrderId);
      setInitModalOpen(false);
      setMessage({ type: 'success', text: 'Customs clearance file initiated.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to initiate customs clearance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declareItem) return;
    try {
      setSubmitting(true);
      await adminApi.submitCustomsDeclaration(declareItem.id, {
        reference: decForm.reference || `DEC-${Date.now()}`,
        exportCountry: decForm.exportCountry.toUpperCase(),
        destinationCountry: decForm.destinationCountry.toUpperCase(),
        exportPort: decForm.exportPort,
        destinationPort: decForm.destinationPort,
        customsBroker: decForm.customsBroker,
        dutiesAndTaxes: Number(decForm.dutiesAndTaxes),
        declarationDate: new Date().toISOString(),
      });
      setDeclareItem(null);
      setMessage({ type: 'success', text: 'Customs declaration submitted and compliance verified.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Compliance check failed (ensure Commercial Invoice PDF is generated for the order).' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (c: any, nextStatus: string) => {
    try {
      await adminApi.updateCustomsStatus(c.id, nextStatus, `Customs officer updated status to ${nextStatus}`);
      setMessage({ type: 'success', text: `Customs ${c.orderNumber} updated to ${nextStatus}.` });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Customs transition blocked.' });
    }
  };

  const existingOrderIds = new Set(clearances.map((c) => c.orderId));
  const availableOrders = orders.filter((o) => !existingOrderIds.has(o.id) && o.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Export & Import Compliance</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Customs Clearance & Port Declarations</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Initiate port clearance files, submit customs declarations, and verify phytosanitary sign-off.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {availableOrders.length > 0 && (
            <Button size="sm" onClick={() => setInitModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Initiate Clearance
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
          <CardTitle className="text-base font-heading font-bold">Customs Declarations ({clearances.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live customs records...</div>
          ) : clearances.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No customs clearances initiated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Order & Buyer</th>
                    <th className="py-3 px-5">Declaration # & Corridor</th>
                    <th className="py-3 px-5">Broker & Duties</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {clearances.map((c) => {
                    const nextOpts = CUSTOMS_NEXT[c.status] || [];
                    return (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-primary">{c.orderNumber}</div>
                          <div className="text-muted-foreground">{c.buyerCompany || '-'}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-semibold">{c.declarationReference || 'Not Submitted'}</div>
                          <div className="text-muted-foreground">
                            {c.exportCountry ? `${c.exportCountry} → ${c.destinationCountry} (${c.destinationPort || ''})` : 'Awaiting declaration'}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div>{c.customsBroker || '-'}</div>
                          <div className="font-mono text-muted-foreground">{c.dutiesAndTaxes != null ? `$${Number(c.dutiesAndTaxes).toLocaleString()}` : '-'}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className={c.status === 'CLEARED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex gap-1.5">
                            {(c.status === 'NOT_STARTED' || c.status === 'DOCUMENTS_PENDING') && (
                              <Button
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  setDeclareItem(c);
                                  setDecForm({
                                    reference: `SB-${c.orderNumber}`,
                                    exportCountry: 'IN',
                                    destinationCountry: 'GB',
                                    exportPort: 'JNPT Port, Mumbai',
                                    destinationPort: 'Port of Felixstowe',
                                    customsBroker: 'Apex Global Customs Brokers',
                                    dutiesAndTaxes: 450,
                                  });
                                }}
                              >
                                <FileCheck className="w-3.5 h-3.5" /> Submit Declaration
                              </Button>
                            )}
                            {nextOpts.map((st) => (
                              <Button key={st} size="sm" variant={st === 'CLEARED' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => handleStatusChange(c, st)}>
                                {st}
                              </Button>
                            ))}
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
              <h3 className="text-lg font-heading font-bold">Initiate Customs Clearance</h3>
              <button onClick={() => setInitModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleInitiate} className="space-y-4 mt-4">
              <select required value={initOrderId} onChange={(e) => setInitOrderId(e.target.value)} className="w-full text-xs bg-background border border-border rounded-md p-2">
                <option value="">Select order...</option>
                {availableOrders.map((o) => (<option key={o.id} value={o.id}>{o.orderNumber} ({o.status})</option>))}
              </select>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setInitModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Initiating...' : 'Initiate'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {declareItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Submit Declaration: {declareItem.orderNumber}</h3>
              <button onClick={() => setDeclareItem(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmitDeclaration} className="space-y-3 mt-4">
              <Input required placeholder="Shipping Bill / Reference #" value={decForm.reference} onChange={(e) => setDecForm({ ...decForm, reference: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input maxLength={2} required placeholder="Export ISO (IN)" value={decForm.exportCountry} onChange={(e) => setDecForm({ ...decForm, exportCountry: e.target.value })} />
                <Input maxLength={2} required placeholder="Dest ISO (GB)" value={decForm.destinationCountry} onChange={(e) => setDecForm({ ...decForm, destinationCountry: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Export Port" value={decForm.exportPort} onChange={(e) => setDecForm({ ...decForm, exportPort: e.target.value })} />
                <Input placeholder="Dest Port" value={decForm.destinationPort} onChange={(e) => setDecForm({ ...decForm, destinationPort: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Customs Broker" value={decForm.customsBroker} onChange={(e) => setDecForm({ ...decForm, customsBroker: e.target.value })} />
                <Input type="number" step="0.01" placeholder="Duties & Taxes ($)" value={decForm.dutiesAndTaxes} onChange={(e) => setDecForm({ ...decForm, dutiesAndTaxes: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDeclareItem(null)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Declaration'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
