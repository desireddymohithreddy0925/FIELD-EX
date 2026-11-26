import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { BookOpen, FileText, Download, Loader2, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments(false);
    const timer = setInterval(() => fetchDocuments(true), 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchDocuments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await buyerApi.getMyDocuments();
      setDocuments(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      if (!silent) console.error('Failed to fetch trade documents', err);
    } finally {
      setLoading(false);
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'COMMERCIAL_INVOICE':
        return <Badge variant="olive">Commercial Invoice</Badge>;
      case 'BILL_OF_LADING':
        return <Badge variant="wheat">Bill of Lading</Badge>;
      case 'PACKING_LIST':
        return <Badge variant="outline" className="border-primary text-primary">Packing List</Badge>;
      case 'PHYTOSANITARY_CERTIFICATE':
        return <Badge variant="outline" className="border-emerald-600 text-emerald-800 bg-emerald-50">Phytosanitary</Badge>;
      case 'CERTIFICATE_OF_ORIGIN':
        return <Badge variant="outline" className="border-blue-600 text-blue-800 bg-blue-50">Certificate of Origin</Badge>;
      default:
        return <Badge variant="outline">{type?.replace('_', ' ') || 'Document'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Fetching verified trade compliance documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <ShieldCheck className="w-3 h-3 text-tertiary" />
            <span>APEDA & Customs Compliance Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Trade Documents</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Cryptographically certified export documentation, phyto-inspections, and ocean shipping manifests.
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchDocuments(false)} size="sm">
          Refresh Documents
        </Button>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-border hover:shadow-card transition-all flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-heading font-bold truncate flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{doc.filename || doc.type}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Order #{doc.orderNumber || doc.orderId?.slice(0, 8)}
                    </p>
                  </div>
                  {getDocTypeBadge(doc.type)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Size:</span>
                  <span className="font-medium text-foreground">
                    {doc.sizeBytes ? (doc.sizeBytes / 1024).toFixed(1) + ' KB' : 'Standard PDF'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Generated {doc.generatedAt ? new Date(doc.generatedAt).toLocaleDateString() : 'Recently'}</span>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  {doc.downloadUrl ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => window.open(doc.downloadUrl, '_blank')}
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-muted-foreground cursor-default"
                      disabled
                    >
                      Archived in Storage
                    </Button>
                  )}
                  {doc.orderId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-secondary p-1 h-auto"
                      onClick={() => navigate(`/buyer/orders/${doc.orderId}`)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-heading font-semibold text-foreground">No Trade Documents Generated Yet</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Export certificates, packing lists, and commercial invoices are generated automatically once an order enters packhouse processing and customs clearance.
            </p>
            <Button 
              variant="default" 
              className="mt-6 bg-primary hover:bg-secondary text-primary-foreground"
              onClick={() => navigate('/buyer/orders')}
            >
              View Active Orders
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
