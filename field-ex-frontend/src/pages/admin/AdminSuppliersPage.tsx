import { useState, useEffect, useCallback } from 'react';
import { Tractor, Plus, RefreshCw, Search, CheckCircle2, AlertCircle, X, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    contactEmail: '',
    region: '',
    farmLocation: '',
    address: '',
    farmingInformation: '',
  });

  const fetchSuppliers = useCallback(async (silent = false) => {
    try {
      const res = await adminApi.getSuppliers();
      setSuppliers(res.content || (Array.isArray(res) ? res : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load suppliers.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchSuppliers(false); }, 0);
    const timer = setInterval(() => {
      if (!modalOpen) void fetchSuppliers(true);
    }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchSuppliers, modalOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminApi.createSupplier(form);
      setModalOpen(false);
      setForm({ name: '', contactPerson: '', phone: '', contactEmail: '', region: '', farmLocation: '', address: '', farmingInformation: '' });
      setMessage({ type: 'success', text: 'Supplier onboarded cleanly to PostgreSQL.' });
      await fetchSuppliers(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create supplier.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (supplier: any) => {
    try {
      if (supplier.active) {
        await adminApi.deactivateSupplier(supplier.id);
      } else {
        await adminApi.activateSupplier(supplier.id);
      }
      await fetchSuppliers(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update supplier status.' });
    }
  };

  const filtered = suppliers.filter((s) =>
    [s.name, s.supplierCode, s.region, s.contactEmail, s.farmLocation]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Tractor className="w-3.5 h-3.5" />
              <span>Farm & Packhouse Network</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Suppliers & Grower Cooperatives</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Live registry of certified farms, APEDA/GLOBALG.A.P packhouses, and sourcing partners.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchSuppliers(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Supplier
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

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search supplier code, farm, region..." className="pl-9 bg-card" />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-heading font-bold">Registered Growers ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live supplier directory...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No suppliers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Code & Name</th>
                    <th className="py-3 px-5">Contact</th>
                    <th className="py-3 px-5">Region & Farm Location</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5">
                        <div className="font-mono text-[11px] text-primary font-bold">{s.supplierCode || 'SUP'}</div>
                        <div className="font-semibold text-sm text-foreground">{s.name}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-foreground">{s.contactPerson || '-'}</div>
                        <div className="text-muted-foreground">{s.contactEmail || s.phone || '-'}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-tertiary" />
                          {s.region || 'India'}
                        </div>
                        <div className="text-muted-foreground">{s.farmLocation || s.address || '-'}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className={s.active ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}>
                          {s.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleToggleActive(s)}>
                          {s.active ? 'Deactivate' : 'Activate'}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Onboard New Supplier</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 mt-4">
              <Input required placeholder="Supplier / Orchard Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                <Input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="email" placeholder="Email Address" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                <Input placeholder="Region (e.g. Maharashtra)" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
              <Input placeholder="Farm Location / Packhouse" value={form.farmLocation} onChange={(e) => setForm({ ...form, farmLocation: e.target.value })} />
              <Input placeholder="Certification / Farming Details (APEDA / GLOBALG.A.P)" value={form.farmingInformation} onChange={(e) => setForm({ ...form, farmingInformation: e.target.value })} />
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Supplier'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
