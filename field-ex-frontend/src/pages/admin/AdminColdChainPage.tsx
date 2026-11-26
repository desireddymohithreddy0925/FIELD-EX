import { useState, useEffect, useCallback } from 'react';
import { Thermometer, Plus, RefreshCw, AlertTriangle, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminColdChainPage() {
  const [readings, setReadings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    batchId: '',
    warehouseId: '',
    temperature: 12.5,
    humidity: 88.0,
    source: 'IOT_SENSOR',
    notes: '',
  });

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [readRes, eventRes, batchRes, whRes] = await Promise.all([
        adminApi.getColdChainReadings(),
        adminApi.getColdChainEvents(),
        adminApi.getBatches(),
        adminApi.getWarehouses(),
      ]);
      setReadings(Array.isArray(readRes) ? readRes : []);
      setEvents(Array.isArray(eventRes) ? eventRes : []);
      setBatches(batchRes.content || (Array.isArray(batchRes) ? batchRes : []));
      setWarehouses(whRes.content || (Array.isArray(whRes) ? whRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load cold-chain telemetry.' });
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

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.recordColdChainReading({
        batchId: form.batchId,
        warehouseId: form.warehouseId,
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        timestamp: new Date().toISOString(),
        source: form.source,
        notes: form.notes,
      });
      setModalOpen(false);
      setMessage({ type: 'success', text: 'Telemetry reading logged; excursion thresholds checked automatically.' });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to record reading.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Thermometer className="w-3.5 h-3.5" />
              <span>Thermal Compliance</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Cold-Chain IoT Telemetry & Excursions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live thermal/humidity sensor logs across warehouses and automatic excursion alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Log Sensor Reading
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

      {events.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-soft">
          <CardHeader className="py-3 px-5 border-b border-amber-500/20">
            <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Active Thermal Excursion Alerts ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 rounded-lg bg-card border border-amber-500/30 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-foreground mr-2">{ev.batchNumber}</span>
                  <span className="text-muted-foreground">{ev.warehouseName}</span>
                  <p className="text-foreground font-medium mt-0.5">{ev.notes}</p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                  {ev.eventTimestamp ? new Date(ev.eventTimestamp).toLocaleString() : ''}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-border shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6">
          <CardTitle className="text-base font-heading font-bold">Live Temperature & Humidity Stream ({readings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading telemetry readings...</div>
          ) : readings.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No temperature readings recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Batch</th>
                    <th className="py-3 px-5">Facility</th>
                    <th className="py-3 px-5">Temperature</th>
                    <th className="py-3 px-5">Humidity</th>
                    <th className="py-3 px-5">Source</th>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {readings.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5 font-mono font-bold text-primary">{r.batchNumber}</td>
                      <td className="py-3.5 px-5 font-medium">{r.warehouseName}</td>
                      <td className="py-3.5 px-5 font-mono font-bold">
                        <span className={r.excursion ? 'text-rose-600' : 'text-emerald-700'}>
                          {Number(r.temperature).toFixed(1)} °C
                        </span>
                        {r.excursion && <Badge variant="destructive" className="ml-2 text-[10px]">Excursion</Badge>}
                      </td>
                      <td className="py-3.5 px-5 font-mono">{r.humidity != null ? `${Number(r.humidity).toFixed(1)}%` : '-'}</td>
                      <td className="py-3.5 px-5"><Badge variant="outline" className="text-[10px]">{r.source}</Badge></td>
                      <td className="py-3.5 px-5 font-mono text-muted-foreground">{r.timestamp ? new Date(r.timestamp).toLocaleString() : '-'}</td>
                      <td className="py-3.5 px-5 text-muted-foreground">{r.notes || '-'}</td>
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
              <h3 className="text-lg font-heading font-bold">Record Cold-Chain Reading</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRecord} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Batch</label>
                <select required value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                  <option value="">Select batch...</option>
                  {batches.map((b) => (<option key={b.id} value={b.id}>{b.batchNumber} ({b.fruitName})</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Warehouse</label>
                <select required value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} className="w-full text-xs bg-background border border-border rounded-md p-2">
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Temp (°C)</label>
                  <Input type="number" step="0.1" required value={form.temperature} onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Humidity (%)</label>
                  <Input type="number" step="0.5" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full h-9 text-xs bg-background border border-border rounded-md px-2">
                    <option value="IOT_SENSOR">IOT_SENSOR</option>
                    <option value="MANUAL_ENTRY">MANUAL_ENTRY</option>
                    <option value="DATA_LOGGER">DATA_LOGGER</option>
                  </select>
                </div>
              </div>
              <Input placeholder="Chamber sensor notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Logging...' : 'Save Reading'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
