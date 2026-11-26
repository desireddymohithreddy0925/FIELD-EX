import { useState, useEffect, useCallback } from 'react';
import { Warehouse, Plus, RefreshCw, MapPin, Thermometer, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminWarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locationsByWh, setLocationsByWh] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [whModalOpen, setWhModalOpen] = useState(false);
  const [locWhId, setLocWhId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [whForm, setWhForm] = useState({
    name: '',
    location: '',
    type: 'COLD_STORAGE',
    capacity: 250,
    minTemperature: 1.0,
    maxTemperature: 14.0,
    minHumidity: 85,
    maxHumidity: 95,
  });
  const [locForm, setLocForm] = useState({ code: '', zone: 'A', capacity: 50 });

  const fetchWarehouses = useCallback(async (silent = false) => {
    try {
      const res = await adminApi.getWarehouses();
      const list = res.content || (Array.isArray(res) ? res : []);
      setWarehouses(list);
      const locEntries = await Promise.all(
        list.map(async (w: any) => {
          try {
            const locs = await adminApi.getStorageLocations(w.id);
            return [w.id, Array.isArray(locs) ? locs : []] as [string, any[]];
          } catch {
            return [w.id, []] as [string, any[]];
          }
        })
      );
      setLocationsByWh(Object.fromEntries(locEntries));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load warehouses.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchWarehouses(false); }, 0);
    const timer = setInterval(() => {
      if (!whModalOpen && !locWhId) void fetchWarehouses(true);
    }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchWarehouses, whModalOpen, locWhId]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.createWarehouse({
        ...whForm,
        capacity: Number(whForm.capacity),
        minTemperature: Number(whForm.minTemperature),
        maxTemperature: Number(whForm.maxTemperature),
        minHumidity: Number(whForm.minHumidity),
        maxHumidity: Number(whForm.maxHumidity),
      });
      setWhModalOpen(false);
      setWhForm({ name: '', location: '', type: 'COLD_STORAGE', capacity: 250, minTemperature: 1, maxTemperature: 14, minHumidity: 85, maxHumidity: 95 });
      setMessage({ type: 'success', text: 'Cold-storage warehouse provisioned in PostgreSQL.' });
      await fetchWarehouses(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create warehouse.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locWhId) return;
    try {
      setSubmitting(true);
      await adminApi.createStorageLocation(locWhId, {
        code: locForm.code,
        zone: locForm.zone,
        capacity: Number(locForm.capacity),
      });
      setLocWhId(null);
      setLocForm({ code: '', zone: 'A', capacity: 50 });
      setMessage({ type: 'success', text: 'Storage bin / zone added to warehouse.' });
      await fetchWarehouses(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add storage location.' });
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
              <Warehouse className="w-3.5 h-3.5" />
              <span>Cold Infrastructure</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Warehouses & Cold Storage Facilities</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Packhouses, controlled-atmosphere chambers, thermal operating bands, and storage zones.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchWarehouses(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setWhModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Facility
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

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading live warehouse network...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((w) => {
            const locs = locationsByWh[w.id] || [];
            return (
              <Card key={w.id} className="border-border shadow-soft">
                <CardHeader className="border-b border-border flex flex-row items-start justify-between gap-2 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-heading font-bold">{w.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{w.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-tertiary" />
                      {w.location || 'India Export Hub'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setLocWhId(w.id)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Zone
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
                      <span className="text-muted-foreground block">Capacity</span>
                      <span className="font-mono font-bold text-sm">{Number(w.capacity || 0).toLocaleString()} MT</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
                      <span className="text-muted-foreground block flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp Range</span>
                      <span className="font-mono font-bold text-sm">{w.minTemperature ?? 2}°C .. {w.maxTemperature ?? 14}°C</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
                      <span className="text-muted-foreground block">Humidity</span>
                      <span className="font-mono font-bold text-sm">{w.minHumidity ?? 85}% .. {w.maxHumidity ?? 95}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground mb-2">Storage Bays / Zones ({locs.length})</p>
                    {locs.length === 0 ? (
                      <p className="text-muted-foreground italic">General bulkhead floor allocation (no sub-zones defined).</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {locs.map((l: any) => (
                          <span key={l.id} className="px-2.5 py-1 rounded-lg bg-accent/60 border border-border font-mono text-[11px]">
                            {l.code || l.zone} ({l.capacity || 0} MT)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {whModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Add Warehouse Facility</h3>
              <button onClick={() => setWhModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateWarehouse} className="space-y-3 mt-4">
              <Input required placeholder="Facility Name" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} />
              <Input required placeholder="City / Port Location" value={whForm.location} onChange={(e) => setWhForm({ ...whForm, location: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select value={whForm.type} onChange={(e) => setWhForm({ ...whForm, type: e.target.value })} className="text-sm bg-background border border-border rounded-md px-3 py-2">
                  <option value="COLD_STORAGE">COLD_STORAGE</option>
                  <option value="PACK_HOUSE">PACK_HOUSE</option>
                  <option value="TRANSIT_HUB">TRANSIT_HUB</option>
                </select>
                <Input type="number" min="1" required placeholder="Capacity (MT)" value={whForm.capacity} onChange={(e) => setWhForm({ ...whForm, capacity: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" step="0.5" placeholder="Min Temp (°C)" value={whForm.minTemperature} onChange={(e) => setWhForm({ ...whForm, minTemperature: parseFloat(e.target.value) || 0 })} />
                <Input type="number" step="0.5" placeholder="Max Temp (°C)" value={whForm.maxTemperature} onChange={(e) => setWhForm({ ...whForm, maxTemperature: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setWhModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Facility'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {locWhId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Add Storage Location</h3>
              <button onClick={() => setLocWhId(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateLocation} className="space-y-3 mt-4">
              <Input required placeholder="Bin / Chamber Code (e.g. CH-A1)" value={locForm.code} onChange={(e) => setLocForm({ ...locForm, code: e.target.value })} />
              <Input required placeholder="Zone (e.g. Zone A)" value={locForm.zone} onChange={(e) => setLocForm({ ...locForm, zone: e.target.value })} />
              <Input type="number" min="1" required placeholder="Capacity (MT)" value={locForm.capacity} onChange={(e) => setLocForm({ ...locForm, capacity: parseFloat(e.target.value) || 0 })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setLocWhId(null)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Zone'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
