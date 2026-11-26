import { useState, useEffect, useCallback } from 'react';
import {
  FileText, RefreshCw, DollarSign, CheckCircle2, ShieldAlert,
  Search, X, Send, Sparkles, Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi, type AdminQuotationUpdatePayload } from '../../services/adminApi';
import { buyerApi } from '../../services/buyerApi';

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [fruits, setFruits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Present Amount & Quotation Pricing Modal State
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [costs, setCosts] = useState({
    packagingCost: 0,
    transportationCost: 0,
    exportHandlingCost: 0,
    shippingCost: 0,
    insuranceCost: 0,
    taxAmount: 0,
    discount: 0,
  });
  const [paymentTerms, setPaymentTerms] = useState('50% Advance upon Order Acceptance, 50% against Bill of Lading');
  const [validityDays, setValidityDays] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const findCatalogVarietyPrice = useCallback((fruitId: string, varietyId: string): { price: number; currency: string } | null => {
    const fruit = fruits.find(f => f.id === fruitId);
    const variety = fruit?.varieties?.find((v: any) => v.id === varietyId);
    if (variety && variety.pricePerKg != null) {
      return { price: Number(variety.pricePerKg), currency: variety.currency || 'USD' };
    }
    return null;
  }, [fruits]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      const [qData, catalogData] = await Promise.all([
        adminApi.getAllQuotations(),
        buyerApi.getFruits({ size: 100 }).catch(() => ({ content: [] })),
      ]);
      const qList = Array.isArray(qData) ? qData : (qData?.content || []);
      const fList = catalogData?.content || (Array.isArray(catalogData) ? catalogData : []);
      setQuotations(qList);
      setFruits(fList);
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        setErrorMessage(err.response?.data?.message || 'Failed to load quotation requests.');
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      void fetchData(false);
    }, 0);
    return () => clearTimeout(initTimer);
  }, [fetchData]);

  // Real-time 4-second live sync (paused while modal is open so admin price edits aren't overwritten)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!selectedQuote) {
        void fetchData(true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [selectedQuote, fetchData]);

  const handleRefresh = () => {
    setIsLoading(true);
    setIsSyncing(true);
    void fetchData(false);
  };

  const openPricingModal = (quote: any) => {
    setSelectedQuote(quote);
    setErrorMessage(null);
    const initialPrices: Record<string, number> = {};
    let resolvedCurrency = quote.currencyCode || 'USD';

    (quote.items || []).forEach((item: any) => {
      const catalogInfo = findCatalogVarietyPrice(item.fruitId, item.varietyId);
      if (item.unitPrice != null && Number(item.unitPrice) > 0) {
        initialPrices[item.id] = Number(item.unitPrice);
      } else if (catalogInfo) {
        initialPrices[item.id] = catalogInfo.price;
        resolvedCurrency = catalogInfo.currency;
      } else {
        initialPrices[item.id] = 3.50;
      }
    });

    setItemPrices(initialPrices);
    setCurrencyCode(resolvedCurrency);
    setCosts({
      packagingCost: Number(quote.packagingCost ?? 0),
      transportationCost: Number(quote.transportationCost ?? 0),
      exportHandlingCost: Number(quote.exportHandlingCost ?? 0),
      shippingCost: Number(quote.shippingCost ?? 0),
      insuranceCost: Number(quote.insuranceCost ?? 0),
      taxAmount: Number(quote.taxAmount ?? 0),
      discount: Number(quote.discount ?? 0),
    });
    setPaymentTerms(quote.paymentTerms || '50% Advance upon Order Acceptance, 50% against Bill of Lading');
    setValidityDays(14);
  };

  const applyCatalogPrices = () => {
    if (!selectedQuote) return;
    const updated: Record<string, number> = { ...itemPrices };
    let updatedCurrency = currencyCode;
    (selectedQuote.items || []).forEach((item: any) => {
      const info = findCatalogVarietyPrice(item.fruitId, item.varietyId);
      if (info) {
        updated[item.id] = info.price;
        updatedCurrency = info.currency;
      }
    });
    setItemPrices(updated);
    setCurrencyCode(updatedCurrency);
  };

  const itemsSubtotal = (selectedQuote?.items || []).reduce((sum: number, item: any) => {
    const unit = Number(itemPrices[item.id] ?? 0);
    const qty = Number(item.quantity ?? 0);
    return sum + unit * qty;
  }, 0);

  const chargesSubtotal =
    Number(costs.packagingCost || 0) +
    Number(costs.transportationCost || 0) +
    Number(costs.exportHandlingCost || 0) +
    Number(costs.shippingCost || 0) +
    Number(costs.insuranceCost || 0) +
    Number(costs.taxAmount || 0);

  const grandTotal = Math.max(0, itemsSubtotal + chargesSubtotal - Number(costs.discount || 0));

  const handleSubmitPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const validityDate = new Date(Date.now() + Math.max(1, validityDays) * 86400 * 1000).toISOString();
      const payload: AdminQuotationUpdatePayload = {
        currencyCode,
        packagingCost: Number(costs.packagingCost || 0),
        transportationCost: Number(costs.transportationCost || 0),
        exportHandlingCost: Number(costs.exportHandlingCost || 0),
        shippingCost: Number(costs.shippingCost || 0),
        insuranceCost: Number(costs.insuranceCost || 0),
        taxAmount: Number(costs.taxAmount || 0),
        discount: Number(costs.discount || 0),
        paymentTerms,
        validityDate,
        itemPrices,
      };
      await adminApi.updateAndSendQuotation(selectedQuote.id, payload);
      setSuccessMessage(`Present amount set (${currencyCode} $${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) and quotation sent to buyer!`);
      setSelectedQuote(null);
      await fetchData(true);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update quotation pricing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.buyerCompanyName && q.buyerCompanyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.items && q.items.some((it: any) =>
        it.fruitName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.varietyName?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SENT': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ACCEPTED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'EXPIRED': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Calculator className="w-3.5 h-3.5 text-tertiary" />
              <span>Commercial Quote & Present Amount Engine</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Live Feed</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
            Buyer Quotations & Present Amount Control
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Admin & Operations Manager console: set fixed pricing per fruit variety & quantity, calculate live present amounts, and dispatch offers. (Synced {lastSynced.toLocaleTimeString()})
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isSyncing} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${(isLoading || isSyncing) ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-muted-foreground hover:text-foreground">
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

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search buyer, fruit, variety..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'REQUESTED', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      <Card className="border-border shadow-soft bg-card overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-heading font-bold text-foreground">
            Live Quotation Requests ({filteredQuotations.length})
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Admin & Manager Accessible
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading buyer quotations...
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No quotations found matching the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Quote ID & Buyer</th>
                    <th className="py-3 px-6">Fruits, Varieties & Quantity</th>
                    <th className="py-3 px-6">Present Amount</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Requested</th>
                    <th className="py-3 px-6 text-right">Pricing Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredQuotations.map((q) => {
                    const computedCatalogAmount = (q.items || []).reduce((sum: number, it: any) => {
                      const cat = findCatalogVarietyPrice(it.fruitId, it.varietyId);
                      const price = it.unitPrice != null ? Number(it.unitPrice) : (cat ? cat.price : 0);
                      return sum + price * Number(it.quantity || 0);
                    }, 0);
                    const displayAmount = q.totalAmount != null ? Number(q.totalAmount) : computedCatalogAmount;
                    const canPrice = q.status === 'REQUESTED' || q.status === 'SENT';

                    return (
                      <tr key={q.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-mono font-bold text-foreground">
                            QT-{q.id.split('-')[0].toUpperCase()}
                          </div>
                          <div className="text-xs font-medium text-foreground mt-0.5">
                            {q.buyerCompanyName || 'Verified Buyer'}
                          </div>
                          {q.buyerEmail && (
                            <div className="text-[11px] text-muted-foreground">{q.buyerEmail}</div>
                          )}
                        </td>

                        <td className="py-4 px-6 space-y-1">
                          {(q.items || []).map((item: any, idx: number) => {
                            const catPrice = findCatalogVarietyPrice(item.fruitId, item.varietyId);
                            const activePrice = item.unitPrice != null ? Number(item.unitPrice) : catPrice?.price;
                            return (
                              <div key={item.id || idx} className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-foreground">{item.fruitName}</span>
                                <span className="text-muted-foreground">({item.varietyName})</span>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  {Number(item.quantity).toLocaleString()} kg
                                </Badge>
                                {activePrice != null && (
                                  <span className="text-[11px] font-mono text-primary">
                                    @ ${activePrice.toFixed(2)}/kg
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </td>

                        <td className="py-4 px-6">
                          {displayAmount > 0 ? (
                            <div>
                              <div className="font-mono font-bold text-sm text-foreground">
                                {q.currencyCode || 'USD'} ${displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              {q.status === 'REQUESTED' && (
                                <span className="text-[10px] text-amber-700 font-medium">
                                  Auto-estimated from live catalog
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Awaiting pricing</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(q.status)}`}>
                            {q.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-muted-foreground">
                          {q.createdAt ? new Date(q.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                        </td>

                        <td className="py-4 px-6 text-right">
                          {canPrice ? (
                            <Button
                              size="sm"
                              onClick={() => openPricingModal(q)}
                              className="h-8 text-xs px-3 gap-1.5 font-semibold"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              {q.status === 'REQUESTED' ? 'Set Present Amount & Send' : 'Update Present Amount'}
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[11px]">
                              <FileText className="w-3 h-3 mr-1" /> Finalized
                            </Badge>
                          )}
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

      {/* Modal: Set Present Amount for Varieties & Quantities */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Set Present Amount: QT-{selectedQuote.id.split('-')[0].toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedQuote.buyerCompanyName} • Configure unit prices per fruit variety & quantity
                </p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPricing} className="p-6 overflow-y-auto space-y-5">
              {/* Variety Line Item Pricing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Variety Pricing & Line Amounts
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={applyCatalogPrices} className="h-7 text-xs gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary" /> Sync Live Catalog Prices
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {(selectedQuote.items || []).map((item: any) => {
                    const liveCatalog = findCatalogVarietyPrice(item.fruitId, item.varietyId);
                    const unitPrice = Number(itemPrices[item.id] ?? 0);
                    const qty = Number(item.quantity ?? 0);
                    const lineAmount = unitPrice * qty;

                    return (
                      <div key={item.id} className="p-3.5 rounded-xl bg-muted/30 border border-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                          <div className="font-semibold text-sm text-foreground">{item.fruitName}</div>
                          <div className="text-xs text-muted-foreground">{item.varietyName} • {qty.toLocaleString()} kg</div>
                          {liveCatalog && (
                            <div className="text-[11px] text-primary font-mono mt-0.5">
                              Catalog fixed: {liveCatalog.currency} ${liveCatalog.price.toFixed(2)}/kg
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-4">
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                            Unit Price / kg ({currencyCode})
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={itemPrices[item.id] ?? 0}
                            onChange={(e) => setItemPrices({ ...itemPrices, [item.id]: parseFloat(e.target.value) || 0 })}
                            className="h-8 text-sm font-mono font-bold"
                          />
                        </div>

                        <div className="sm:col-span-3 text-right">
                          <span className="text-[11px] text-muted-foreground block">Line Amount</span>
                          <span className="font-mono font-bold text-sm text-foreground">
                            {currencyCode} ${lineAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Commercial Terms & Freight Charges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Currency</label>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full h-9 text-xs bg-background border border-border rounded-md px-2.5 font-medium"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AED">AED</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Packaging</label>
                  <Input type="number" step="0.01" min="0" value={costs.packagingCost}
                    onChange={(e) => setCosts({ ...costs, packagingCost: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Shipping</label>
                  <Input type="number" step="0.01" min="0" value={costs.shippingCost}
                    onChange={(e) => setCosts({ ...costs, shippingCost: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Transportation</label>
                  <Input type="number" step="0.01" min="0" value={costs.transportationCost}
                    onChange={(e) => setCosts({ ...costs, transportationCost: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Export Handling</label>
                  <Input type="number" step="0.01" min="0" value={costs.exportHandlingCost}
                    onChange={(e) => setCosts({ ...costs, exportHandlingCost: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Insurance</label>
                  <Input type="number" step="0.01" min="0" value={costs.insuranceCost}
                    onChange={(e) => setCosts({ ...costs, insuranceCost: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Tax Amount</label>
                  <Input type="number" step="0.01" min="0" value={costs.taxAmount}
                    onChange={(e) => setCosts({ ...costs, taxAmount: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Discount</label>
                  <Input type="number" step="0.01" min="0" value={costs.discount}
                    onChange={(e) => setCosts({ ...costs, discount: parseFloat(e.target.value) || 0 })} className="h-9 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Payment Terms</label>
                  <Input
                    required
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Valid For (Days)</label>
                  <Input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value) || 14)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Present Amount Grand Total Summary */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>Produce Subtotal: <strong className="text-foreground">{currencyCode} ${itemsSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
                  <div>Logistics/Fees: <strong className="text-foreground">{currencyCode} ${chargesSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> • Discount: <strong className="text-emerald-700">-{currencyCode} ${Number(costs.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-primary block">Total Present Amount</span>
                  <span className="text-2xl font-heading font-extrabold text-foreground font-mono">
                    {currencyCode} ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2 font-semibold">
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Confirm Present Amount & Send Offer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
