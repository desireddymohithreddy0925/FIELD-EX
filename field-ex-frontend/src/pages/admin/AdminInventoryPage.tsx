import { useState, useEffect, useCallback } from 'react';
import { PackageSearch, Plus, RefreshCw, CheckCircle2, AlertCircle, X, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminInventoryPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [txModal, setTxModal] = useState<{ inv: any; list: any[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [receiveForm, setReceiveForm] = useState({ batchId: '', quantity: 1000, reason: 'Cold room intake', reference: '' });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [invRes, batchRes] = await Promise.all([
        adminApi.getInventories(),
        adminApi.getBatches(),
      ]);
      setInventories(invRes.content || (Array.isArray(invRes) ? invRes : []));
      setBatches(batchRes.content || (Array.isArray(batchRes) ? batchRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load inventory.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchData(false); }, 0);
    const timer = setInterval(() => {
      if (!receiveModalOpen && !txModal) void fetchData(true);
    }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchData, receiveModalOpen, txModal]);

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.receiveBatchInventory(receiveForm.batchId, {
        quantity: Number(receiveForm.quantity),
        reason: receiveForm.reason,
        reference: receiveForm.reference || 'INTAKE',
      });
      setReceiveModalOpen(false);
      setMessage({ type: 'success', text: 'Batch stock received into live warehouse inventory.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to receive batch inventory.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openTransactions = async (inv: any) => {
    try {
      const txs = await adminApi.getInventoryTransactions(inv.id);
      setTxModal({ inv, list: Array.isArray(txs) ? txs : [] });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load transactions.' });
    }
  };

  const totalAvailKg = inventories.reduce((s, i) => s + Number(i.availableQuantity || 0), 0);
  const totalResKg = inventories.reduce((s, i) => s + Number(i.reservedQuantity || 0), 0);
  const totalPackedKg = inventories.reduce((s, i) => s + Number(i.packedQuantity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <PackageSearch className="w-3.5 h-3.5" />
              <span>FIFO Warehouse Ledger</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Real-Time Cold Inventory</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live available, reserved, packed, and dispatched stock across all fruit batches.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setReceiveModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Receive Batch Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-soft">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Available to Allocate</span>
            <p className="text-2xl font-mono font-extrabold text-emerald-700 mt-1">{totalAvailKg.toLocaleString()} kg</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-soft">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Reserved for Orders</span>
            <p className="text-2xl font-mono font-extrabold text-amber-700 mt-1">{totalResKg.toLocaleString()} kg</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-soft">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Packed / Export Ready</span>
            <p className="text-2xl font-mono font-extrabold text-primary mt-1">{totalPackedKg.toLocaleString()} kg</p>
          </CardContent>
        </Card>
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
          <CardTitle className="text-base font-heading font-bold">Batch Inventory Positions ({inventories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live inventory...</div>
          ) : inventories.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No inventory positions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Batch & Produce</th>
                    <th className="py-3 px-5">Warehouse</th>
                    <th className="py-3 px-5">Total</th>
                    <th className="py-3 px-5">Available</th>
                    <th className="py-3 px-5">Reserved</th>
                    <th className="py-3 px-5">Packed</th>
                    <th className="py-3 px-5 text-right">Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {inventories.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-primary">{inv.batchNumber}</div>
                        <div className="text-foreground font-medium">{inv.fruitName} • {inv.varietyName}</div>
                      </td>
                      <td className="py-3.5 px-5">{inv.warehouseName || '-'}</td>
                      <td className="py-3.5 px-5 font-mono font-bold">{Number(inv.totalQuantity || 0).toLocaleString()} kg</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-emerald-700">{Number(inv.availableQuantity || 0).toLocaleString()} kg</td>
                      <td className="py-3.5 px-5 font-mono text-amber-700">{Number(inv.reservedQuantity || 0).toLocaleString()} kg</td>
                      <td className="py-3.5 px-5 font-mono text-primary">{Number(inv.packedQuantity || 0).toLocaleString()} kg</td>
                      <td className="py-3.5 px-5 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openTransactions(inv)}>
                          <History className="w-3.5 h-3.5" /> Ledger
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Receive Batch Stock into Inventory</h3>
              <button onClick={() => setReceiveModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleReceive} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Fruit Batch</label>
                <select required value={receiveForm.batchId} onChange={(e) => setReceiveForm({ ...receiveForm, batchId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                  <option value="">Select batch...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.batchNumber} — {b.fruitName} ({b.varietyName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Quantity (kg)</label>
                <Input type="number" min="1" required value={receiveForm.quantity} onChange={(e) => setReceiveForm({ ...receiveForm, quantity: parseFloat(e.target.value) || 0 })} />
              </div>
              <Input placeholder="Intake Reason" value={receiveForm.reason} onChange={(e) => setReceiveForm({ ...receiveForm, reason: e.target.value })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setReceiveModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Receiving...' : 'Receive Stock'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {txModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Inventory Ledger: {txModal.inv.batchNumber}</h3>
              <button onClick={() => setTxModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto mt-3 space-y-2 text-xs">
              {txModal.list.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center">No transactions recorded.</p>
              ) : (
                txModal.list.map((tx: any) => (
                  <div key={tx.id} className="p-3 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="text-[10px] mr-2">{tx.type}</Badge>
                      <span className="font-medium text-foreground">{tx.reason || 'Movement'}</span>
                      <div className="text-muted-foreground mt-0.5">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="font-mono font-bold text-primary">{Number(tx.quantity).toLocaleString()} kg</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
