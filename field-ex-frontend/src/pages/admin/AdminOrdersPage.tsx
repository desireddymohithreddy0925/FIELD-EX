import { useState, useEffect } from 'react';
import { 
  History, CheckCircle2, RefreshCw, 
  Search, X, ShieldAlert, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi, type OrderStatusHistoryDto } from '../../services/adminApi';

const ORDER_STATUS_ORDER = [
  'QUOTE_ACCEPTED',
  'PAYMENT_PENDING',
  'PAID',
  'PROCESSING',
  'PACKED',
  'DISPATCHED',
  'IN_TRANSIT',
  'CUSTOMS',
  'DELIVERED',
  'CANCELLED'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  
  // History Modal State (Admin & Manager Only)
  const [historyOrder, setHistoryOrder] = useState<any | null>(null);
  const [historyList, setHistoryList] = useState<OrderStatusHistoryDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Transition Modal State
  const [transitionOrder, setTransitionOrder] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('PROCESSING');
  const [transitionNotes, setTransitionNotes] = useState<string>('');
  const [isSubmittingTransition, setIsSubmittingTransition] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllOrders();
      setOrders(Array.isArray(data) ? data : (data?.content || []));
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openHistoryModal = async (order: any) => {
    setHistoryOrder(order);
    setIsLoadingHistory(true);
    try {
      const histories = await adminApi.getOrderHistory(order.id);
      setHistoryList(histories);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to load order lifecycle history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionOrder) return;
    setIsSubmittingTransition(true);
    setErrorMessage(null);
    try {
      await adminApi.transitionOrderStatus(transitionOrder.id, targetStatus, transitionNotes);
      setStatusMessage(`Order ${transitionOrder.orderNumber} successfully transitioned to ${targetStatus}!`);
      setTransitionOrder(null);
      setTransitionNotes('');
      await fetchOrders();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to transition order status.');
    } finally {
      setIsSubmittingTransition(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = selectedStatusFilter === 'ALL' || o.status === selectedStatusFilter;
    const matchesSearch = 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.buyerId && o.buyerId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUOTE_ACCEPTED': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'PAYMENT_PENDING': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'PAID': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PROCESSING': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'PACKED': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'DISPATCHED': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'IN_TRANSIT': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'CUSTOMS': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DELIVERED': return 'bg-green-100 text-green-900 border-green-300';
      case 'CANCELLED': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <History className="w-3.5 h-3.5 text-tertiary" />
            <span>Executive Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Orders & Lifecycle Audit History</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Admin & Manager privileged console: view full chronological audit history of order states, transition actors, and notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Search order number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'QUOTE_ACCEPTED', 'PAID', 'PROCESSING', 'PACKED', 'DISPATCHED', 'CUSTOMS', 'DELIVERED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatusFilter === st
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-border shadow-soft bg-card overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-heading font-bold text-foreground">
            Commercial Orders Directory ({filteredOrders.length})
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Admin & Manager Accessible
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No orders found matching the filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Order Number</th>
                    <th className="py-3 px-6">Current Status</th>
                    <th className="py-3 px-6">Total Amount</th>
                    <th className="py-3 px-6">Items Count</th>
                    <th className="py-3 px-6">Date Placed</th>
                    <th className="py-3 px-6 text-right">Auditing & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-foreground text-sm">
                        {order.orderNumber}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono font-semibold text-foreground">
                        {order.currencyCode} ${Number(order.totalAmount).toLocaleString()}
                      </td>

                      <td className="py-4 px-6 text-muted-foreground">
                        {order.items?.length || 0} cultivar line(s)
                      </td>

                      <td className="py-4 px-6 text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openHistoryModal(order)}
                            className="h-8 text-xs px-2.5 gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/10"
                          >
                            <History className="w-3.5 h-3.5" />
                            View History
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              setTransitionOrder(order);
                              setTargetStatus('PROCESSING');
                            }}
                            className="h-8 text-xs px-2.5 gap-1 font-semibold"
                          >
                            Transition
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Order Lifecycle History (Admin & Manager Only) */}
      {historyOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    Lifecycle Audit History: {historyOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Immutable transition log recorded for HQ Compliance
                  </p>
                </div>
              </div>
              <button onClick={() => setHistoryOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading lifecycle entries...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  No history transitions found for this order.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {historyList.map((entry, idx) => (
                    <div key={entry.id || idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>

                      <div className="p-3 rounded-xl bg-muted/20 border border-border/60 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(entry.status)}`}>
                            {entry.status}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                          </span>
                        </div>

                        <p className="text-xs text-foreground font-medium">
                          {entry.notes || 'Status updated'}
                        </p>

                        <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-tertiary" />
                            Actor: <strong>{entry.actorName}</strong> ({entry.actorEmail})
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {entry.actorRole}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-border bg-muted/10 flex justify-end">
              <Button size="sm" onClick={() => setHistoryOrder(null)}>
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: State Machine Transition */}
      {transitionOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-heading font-bold text-lg text-foreground">
                Transition Status: {transitionOrder.orderNumber}
              </h3>
              <button onClick={() => setTransitionOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransition} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 font-medium"
                >
                  {ORDER_STATUS_ORDER.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Transition Reason / Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Packhouse inspection approved batch #45; staging for refrigerated dispatch"
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  className="w-full text-xs bg-background border border-border rounded-md p-2.5 text-foreground"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setTransitionOrder(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingTransition} className="gap-2 font-semibold">
                  {isSubmittingTransition && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Execute Transition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
