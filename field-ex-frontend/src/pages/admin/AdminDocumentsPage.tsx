import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, RefreshCw, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { adminApi } from '../../services/adminApi';

const DOC_TYPES = [
  'PROFORMA_INVOICE',
  'COMMERCIAL_INVOICE',
  'PACKING_LIST',
  'BILL_OF_LADING',
  'CERTIFICATE_OF_ORIGIN',
  'PHYTOSANITARY_CERTIFICATE',
  'QUALITY_CERTIFICATE',
];

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedType, setSelectedType] = useState('COMMERCIAL_INVOICE');

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [docsRes, ordRes] = await Promise.all([
        adminApi.getAllDocuments(),
        adminApi.getAllOrders({ size: 100 }),
      ]);
      setDocuments(Array.isArray(docsRes) ? docsRes : []);
      setOrders(ordRes.content || (Array.isArray(ordRes) ? ordRes : []));
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load export documents.' });
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.generateDocument(selectedOrderId, selectedType);
      setModalOpen(false);
      setMessage({ type: 'success', text: `Generated PDF export document (${selectedType}).` });
      await fetchData(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate document.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const blob = await adminApi.downloadDocumentBlob(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename || `${doc.type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to download PDF.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Export Compliance & PDFs</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Sync ({lastSynced.toLocaleTimeString()})</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Export Documents & Trade Certificates</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Generate live Commercial Invoices, Packing Lists, Bills of Lading, and Phytosanitary Certificates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); void fetchData(false); }}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Generate PDF Document
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
          <CardTitle className="text-base font-heading font-bold">Generated Documents Registry ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading live documents...</div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No export documents generated yet. Click "+ Generate PDF Document".</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase font-semibold">
                    <th className="py-3 px-5">Order & Buyer</th>
                    <th className="py-3 px-5">Document Type</th>
                    <th className="py-3 px-5">Filename & Size</th>
                    <th className="py-3 px-5">Generated By / At</th>
                    <th className="py-3 px-5 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-primary">{doc.orderNumber}</div>
                        <div className="text-muted-foreground">{doc.buyerCompany || '-'}</div>
                      </td>
                      <td className="py-3.5 px-5"><Badge variant="outline">{doc.type}</Badge></td>
                      <td className="py-3.5 px-5 font-mono">
                        <div>{doc.filename}</div>
                        <div className="text-[11px] text-muted-foreground">{Math.max(1, Math.round((doc.sizeBytes || 0) / 1024))} KB</div>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground">
                        <div>{doc.generatedBy || 'system'}</div>
                        <div>{doc.generatedAt ? new Date(doc.generatedAt).toLocaleString() : '-'}</div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDownload(doc)}>
                          <Download className="w-3.5 h-3.5" /> PDF
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-heading font-bold">Generate Official Export PDF</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Commercial Order</label>
                <select required value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} className="w-full text-xs bg-background border border-border rounded-md p-2">
                  <option value="">Select order...</option>
                  {orders.filter((o) => o.status !== 'CANCELLED').map((o) => (
                    <option key={o.id} value={o.id}>{o.orderNumber} ({o.status} • {o.currencyCode} {Number(o.totalAmount || 0).toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Document Type</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full text-xs bg-background border border-border rounded-md p-2">
                  {DOC_TYPES.map((t) => (<option key={t} value={t}>{t.replaceAll('_', ' ')}</option>))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Rendering PDF...' : 'Generate Document'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
