import { useState, useEffect, useCallback } from 'react';
import { History, RefreshCw, Search, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi, type AuditLogDto } from '../../services/adminApi';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLogs = useCallback(async (silent = false) => {
    try {
      const res = await adminApi.getAuditLogs(0, 100);
      setLogs(res.content || (Array.isArray(res) ? res : []));
      setErrorMessage(null);
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setErrorMessage(err.response?.data?.message || 'Failed to load immutable audit logs.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = setTimeout(() => { void fetchLogs(false); }, 0);
    const timer = setInterval(() => { void fetchLogs(true); }, 4000);
    return () => {
      clearTimeout(init);
      clearInterval(timer);
    };
  }, [fetchLogs]);

  const filtered = logs.filter((l) =>
    [l.actor, l.action, l.resourceType, l.resourceId, l.metadata]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Governance Watchdog</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Stream ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">System Audit Log & Security Trail</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Immutable record of role changes, password updates, pricing revisions, and commercial order transitions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchLogs(false); }}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{errorMessage}</div>
      )}

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter by actor email, action, order #, resource..." className="pl-9 bg-card" />
      </div>

      <Card className="border-border shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6 flex flex-row items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-heading font-bold">Audit Entries ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live audit logs...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No matching audit log events.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Actor</th>
                    <th className="py-3 px-5">Action</th>
                    <th className="py-3 px-5">Resource</th>
                    <th className="py-3 px-5">Event Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5 font-mono text-muted-foreground whitespace-nowrap">
                        {l.timestamp ? new Date(l.timestamp).toLocaleString() : '-'}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-medium text-foreground">{l.actor}</td>
                      <td className="py-3.5 px-5"><Badge variant="outline" className="text-[10px] font-semibold">{l.action}</Badge></td>
                      <td className="py-3.5 px-5 font-mono text-[11px]">{l.resourceType} • {l.resourceId}</td>
                      <td className="py-3.5 px-5 text-foreground">{l.metadata}</td>
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
