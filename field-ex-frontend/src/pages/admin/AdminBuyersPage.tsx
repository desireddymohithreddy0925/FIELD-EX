import { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw, Search, Globe, Anchor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

export default function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBuyers = useCallback(async (silent = false) => {
    try {
      const data = await adminApi.getBuyers();
      setBuyers(Array.isArray(data) ? data : []);
      setErrorMessage(null);
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setErrorMessage(err.response?.data?.message || 'Failed to load international buyers.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchBuyers(false); }, 0);
    const timer = setInterval(() => { void fetchBuyers(true); }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchBuyers]);

  const filtered = buyers.filter((b) =>
    [b.companyName, b.contactPerson, b.email, b.country, b.destinationPort]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Users className="w-3.5 h-3.5" />
              <span>Commercial Import Network</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">International Buyers Directory</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Verified commercial buyers, consignee ports, and EORI/VAT profiles.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchBuyers(false); }}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{errorMessage}</div>
      )}

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search company, country, destination port..." className="pl-9 bg-card" />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6">
          <CardTitle className="text-base font-heading font-bold">Registered Buyer Organizations ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live buyers...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No buyers match your filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Company & Registration</th>
                    <th className="py-3 px-5">Primary Contact</th>
                    <th className="py-3 px-5">Destination Port & Country</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-sm text-foreground">{b.companyName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{b.registrationInformation || 'Verified Importer'}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-foreground">{b.contactPerson || '-'}</div>
                        <div className="text-muted-foreground">{b.email} {b.phone ? `• ${b.phone}` : ''}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Globe className="w-3.5 h-3.5 text-primary" />
                          <span>{b.destinationCity ? `${b.destinationCity}, ` : ''}{b.country || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <Anchor className="w-3 h-3 text-tertiary" />
                          <span>{b.destinationPort || 'Port TBD'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className={b.active ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}>
                          {b.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
