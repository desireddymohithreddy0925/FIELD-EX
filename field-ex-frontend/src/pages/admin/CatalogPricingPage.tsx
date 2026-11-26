import { useState, useEffect, useCallback } from 'react';
import { 
  Globe, Plus, Edit2, DollarSign, Sparkles, RefreshCw, 
  CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { buyerApi } from '../../services/buyerApi';
import { adminApi, type PricingUpdatePayload } from '../../services/adminApi';

interface FruitVariety {
  id: string;
  name: string;
  grade: string;
  brixLevel: string;
  description: string;
  pricePerKg?: number;
  currency?: string;
  availableQuantity?: number;
  minOrderQuantity?: number;
  unit?: string;
}

interface Fruit {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  description: string;
  hsCode: string;
  varieties: FruitVariety[];
}

export default function CatalogPricingPage() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Price Modal State
  const [priceModalVariety, setPriceModalVariety] = useState<{ fruit: Fruit; variety: FruitVariety } | null>(null);
  const [pricingForm, setPricingForm] = useState<PricingUpdatePayload>({
    pricePerKg: 0,
    currency: 'USD',
    availableQuantity: 10000,
    minOrderQuantity: 500,
    unit: 'KG'
  });
  const [previewSampleQtyKg, setPreviewSampleQtyKg] = useState<number>(1000);
  const [isSubmittingPricing, setIsSubmittingPricing] = useState(false);

  // Variety Specs Modal State
  const [specsModalVariety, setSpecsModalVariety] = useState<{ fruitId: string; variety: FruitVariety } | null>(null);
  const [specsForm, setSpecsForm] = useState({
    name: '',
    grade: '',
    brixLevel: '',
    description: '',
  });
  const [isSubmittingSpecs, setIsSubmittingSpecs] = useState(false);

  // New Fruit Modal
  const [isNewFruitModalOpen, setIsNewFruitModalOpen] = useState(false);
  const [newFruitForm, setNewFruitForm] = useState({
    name: '',
    scientificName: '',
    category: 'TROPICAL',
    description: '',
    hsCode: '080450',
  });
  const [isSubmittingFruit, setIsSubmittingFruit] = useState(false);

  // New Variety Modal
  const [newVarietyFruitId, setNewVarietyFruitId] = useState<string | null>(null);
  const [newVarietyForm, setNewVarietyForm] = useState({
    name: '',
    grade: 'Export Grade A',
    brixLevel: '18-20° Brix',
    description: '',
    pricePerKg: 3.50,
    currency: 'USD',
    availableQuantity: 10000,
    minOrderQuantity: 500,
    unit: 'KG',
  });
  const [isSubmittingVariety, setIsSubmittingVariety] = useState(false);

  const toKgMultiplier = (unit?: string) => (unit === 'MT' ? 1000 : 1);

  const fetchCatalog = useCallback(async (silent = false) => {
    try {
      const res = await buyerApi.getFruits({ page: 0, size: 50 });
      const fruitList = res.content || [];
      const fullFruits = await Promise.all(
        fruitList.map(async (f: any) => {
          try {
            return await buyerApi.getFruitDetails(f.id);
          } catch {
            return f;
          }
        })
      );
      setFruits(fullFruits);
      setErrorMessage(null);
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        if (!err.response) {
          setErrorMessage('Cannot connect to backend server. Please ensure Spring Boot is running on port 8080.');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setErrorMessage('Session expired. Please log out and sign in again as Administrator.');
        } else {
          setErrorMessage(err.response?.data?.message || 'Failed to load fruits catalog.');
        }
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      void fetchCatalog(false);
    }, 0);
    return () => clearTimeout(initTimer);
  }, [fetchCatalog]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!priceModalVariety && !specsModalVariety && !isNewFruitModalOpen && !newVarietyFruitId) {
        void fetchCatalog(true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [priceModalVariety, specsModalVariety, isNewFruitModalOpen, newVarietyFruitId, fetchCatalog]);

  const handleRefresh = () => {
    setIsLoading(true);
    setIsSyncing(true);
    setErrorMessage(null);
    void fetchCatalog(false);
  };

  const openPricingModal = (fruit: Fruit, variety: FruitVariety) => {
    setPriceModalVariety({ fruit, variety });
    const unit = variety.unit ?? 'KG';
    const minQty = variety.minOrderQuantity ?? 500;
    setPricingForm({
      pricePerKg: variety.pricePerKg ?? 3.50,
      currency: variety.currency ?? 'USD',
      availableQuantity: variety.availableQuantity ?? 10000,
      minOrderQuantity: minQty,
      unit,
    });
    setPreviewSampleQtyKg(Math.max(500, minQty * toKgMultiplier(unit)));
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceModalVariety) return;
    setIsSubmittingPricing(true);
    setErrorMessage(null);
    try {
      await adminApi.updatePricing(priceModalVariety.variety.id, pricingForm);
      setSuccessMessage(`Pricing & inventory updated for ${priceModalVariety.variety.name}`);
      setPriceModalVariety(null);
      await fetchCatalog();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update pricing.');
    } finally {
      setIsSubmittingPricing(false);
    }
  };

  const openSpecsModal = (fruitId: string, variety: FruitVariety) => {
    setSpecsModalVariety({ fruitId, variety });
    setSpecsForm({
      name: variety.name,
      grade: variety.grade,
      brixLevel: variety.brixLevel,
      description: variety.description,
    });
  };

  const handleSaveSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specsModalVariety) return;
    setIsSubmittingSpecs(true);
    setErrorMessage(null);
    try {
      await adminApi.updateVarietySpecs(specsModalVariety.variety.id, specsForm);
      setSuccessMessage(`Quality specifications updated for ${specsForm.name}`);
      setSpecsModalVariety(null);
      await fetchCatalog();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update specifications.');
    } finally {
      setIsSubmittingSpecs(false);
    }
  };

  const handleCreateFruit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFruit(true);
    try {
      await buyerApi.createFruit(newFruitForm);
      setIsNewFruitModalOpen(false);
      setNewFruitForm({ name: '', scientificName: '', category: 'TROPICAL', description: '', hsCode: '080450' });
      setSuccessMessage('Fruit registered successfully!');
      await fetchCatalog();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to create fruit.');
    } finally {
      setIsSubmittingFruit(false);
    }
  };

  const handleCreateVariety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarietyFruitId) return;
    setIsSubmittingVariety(true);
    try {
      await buyerApi.createVariety(newVarietyFruitId, newVarietyForm);
      setNewVarietyFruitId(null);
      setNewVarietyForm({
        name: '', grade: 'Export Grade A', brixLevel: '18-20° Brix', description: '',
        pricePerKg: 3.50, currency: 'USD', availableQuantity: 10000, minOrderQuantity: 500, unit: 'KG'
      });
      setSuccessMessage('New cultivar variety registered with live pricing!');
      await fetchCatalog(true);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to add variety.');
    } finally {
      setIsSubmittingVariety(false);
    }
  };

  const filteredFruits = fruits.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.varieties && f.varieties.some(v => v.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <Globe className="w-3.5 h-3.5 text-tertiary" />
              <span>Commercial Produce Governance</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Live Feed</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Catalog, Fruits & Price Fixing</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Admin & Operations Manager console: fix cultivar prices, configure available quantities, calculate present amounts, and edit grades. (Synced {lastSynced.toLocaleTimeString()})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isSyncing} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${(isLoading || isSyncing) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsNewFruitModalOpen(true)} className="gap-2 font-semibold">
            <Plus className="w-4 h-4" />
            + Add Produce / Fruit
          </Button>
        </div>
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
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Input 
          placeholder="Filter cultivars, fruits, quality grades..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md bg-card"
        />
      </div>

      {/* Fruit & Varieties List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading live produce catalog...
          </div>
        ) : filteredFruits.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm bg-card rounded-2xl border border-border">
            No produce items found. Click "+ Add Produce / Fruit" to seed the catalog.
          </div>
        ) : (
          filteredFruits.map((fruit) => (
            <Card key={fruit.id} className="border-border shadow-soft bg-card overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {fruit.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-heading font-bold text-foreground">
                        {fruit.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[11px] font-mono">
                        HS: {fruit.hsCode || '080450'}
                      </Badge>
                      <Badge variant="secondary" className="text-[11px]">
                        {fruit.category || 'TROPICAL'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{fruit.scientificName || fruit.description}</p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setNewVarietyFruitId(fruit.id)}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Variety
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold">
                        <th className="py-3 px-6">Variety & Cultivar</th>
                        <th className="py-3 px-6">Export Quality Grade</th>
                        <th className="py-3 px-6">Brix Sweetness</th>
                        <th className="py-3 px-6">Fixed Price</th>
                        <th className="py-3 px-6">Available Stock</th>
                        <th className="py-3 px-6">Present Stock Amount</th>
                        <th className="py-3 px-6">Min Order</th>
                        <th className="py-3 px-6 text-right">Commercial Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {(!fruit.varieties || fruit.varieties.length === 0) ? (
                        <tr>
                          <td colSpan={8} className="py-6 px-6 text-center text-muted-foreground">
                            No varieties registered for {fruit.name}. Click "+ Add Variety" to create one.
                          </td>
                        </tr>
                      ) : (
                        fruit.varieties.map((variety) => {
                          const unitPrice = Number(variety.pricePerKg ?? 3.50);
                          const availQty = Number(variety.availableQuantity ?? 10000);
                          const availKg = availQty * toKgMultiplier(variety.unit || 'KG');
                          const presentStockAmount = unitPrice * availKg;

                          return (
                          <tr key={variety.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3.5 px-6 font-semibold text-foreground text-sm">
                              {variety.name}
                              {variety.description && (
                                <p className="text-[11px] font-normal text-muted-foreground line-clamp-1">{variety.description}</p>
                              )}
                            </td>
                            <td className="py-3.5 px-6">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {variety.grade || 'Export Grade A'}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-medium text-amber-900">
                              <span className="inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                {variety.brixLevel || '18-22° Brix'}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-mono font-bold text-foreground text-sm">
                              {variety.currency || 'USD'} ${unitPrice.toFixed(2)} / kg
                            </td>
                            <td className="py-3.5 px-6 font-medium text-foreground">
                              {availQty.toLocaleString()} {variety.unit || 'KG'}
                            </td>
                            <td className="py-3.5 px-6 font-mono font-bold text-primary text-sm">
                              {variety.currency || 'USD'} ${presentStockAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-6 text-muted-foreground">
                              {(variety.minOrderQuantity ?? 500).toLocaleString()} {variety.unit || 'KG'}
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openSpecsModal(fruit.id, variety)}
                                  className="h-7 text-xs px-2.5 gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Specs
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => openPricingModal(fruit, variety)}
                                  className="h-7 text-xs px-2.5 gap-1 font-semibold bg-primary text-primary-foreground shadow-sm"
                                >
                                  <DollarSign className="w-3 h-3" />
                                  Fix Price
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Fix Variety Pricing & Quantity */}
      {priceModalVariety && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Fix Price & Stock Quantity
                </h3>
                <p className="text-xs text-muted-foreground">
                  {priceModalVariety.fruit.name} • {priceModalVariety.variety.name}
                </p>
              </div>
              <button onClick={() => setPriceModalVariety(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Fixed Price / kg</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input 
                      type="number"
                      step="0.01"
                      required
                      value={pricingForm.pricePerKg}
                      onChange={(e) => setPricingForm({ ...pricingForm, pricePerKg: parseFloat(e.target.value) || 0 })}
                      className="pl-8 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Currency</label>
                  <select
                    value={pricingForm.currency}
                    onChange={(e) => setPricingForm({ ...pricingForm, currency: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 font-medium"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Available Quantity</label>
                  <Input 
                    type="number"
                    step="0.1"
                    required
                    value={pricingForm.availableQuantity}
                    onChange={(e) => setPricingForm({ ...pricingForm, availableQuantity: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Unit of Measure</label>
                  <select
                    value={pricingForm.unit || 'MT'}
                    onChange={(e) => setPricingForm({ ...pricingForm, unit: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 font-medium"
                  >
                    <option value="MT">Metric Ton (MT)</option>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="BOX">Standard Export Box</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Minimum Order Quantity (MOQ)</label>
                <Input 
                  type="number"
                  step="0.1"
                  required
                  value={pricingForm.minOrderQuantity}
                  onChange={(e) => setPricingForm({ ...pricingForm, minOrderQuantity: parseFloat(e.target.value) || 0 })}
                  className="text-sm"
                />
              </div>

              {/* Live Present Amount Preview Box */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">Present Amount Calculator</span>
                  <span className="font-mono font-bold text-foreground">
                    Total Lot Value: {pricingForm.currency} ${(pricingForm.pricePerKg * pricingForm.availableQuantity * toKgMultiplier(pricingForm.unit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-primary/15">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Quantity (kg):</span>
                    <Input
                      type="number"
                      min="1"
                      step="50"
                      value={previewSampleQtyKg}
                      onChange={(e) => setPreviewSampleQtyKg(parseFloat(e.target.value) || 0)}
                      className="h-7 w-24 text-xs font-mono"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground mr-1">Present Amount:</span>
                    <span className="font-mono font-bold text-sm text-primary">
                      {pricingForm.currency} ${(pricingForm.pricePerKg * previewSampleQtyKg).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setPriceModalVariety(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingPricing} className="gap-2 font-semibold">
                  {isSubmittingPricing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm & Update Price
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Variety Quality Specs */}
      {specsModalVariety && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Edit Variety & Quality Specs
                </h3>
                <p className="text-xs text-muted-foreground">{specsModalVariety.variety.name}</p>
              </div>
              <button onClick={() => setSpecsModalVariety(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecs} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Variety Name</label>
                <Input 
                  required
                  value={specsForm.name}
                  onChange={(e) => setSpecsForm({ ...specsForm, name: e.target.value })}
                  className="text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Quality Grade</label>
                  <Input 
                    required
                    value={specsForm.grade}
                    onChange={(e) => setSpecsForm({ ...specsForm, grade: e.target.value })}
                    placeholder="e.g. Export Grade A"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Brix Sweetness Rating</label>
                  <Input 
                    required
                    value={specsForm.brixLevel}
                    onChange={(e) => setSpecsForm({ ...specsForm, brixLevel: e.target.value })}
                    placeholder="e.g. 19-22° Brix"
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Description & Characteristics</label>
                <textarea
                  rows={3}
                  value={specsForm.description}
                  onChange={(e) => setSpecsForm({ ...specsForm, description: e.target.value })}
                  className="w-full text-xs bg-background border border-border rounded-md p-2.5 text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setSpecsModalVariety(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingSpecs} className="gap-2 font-semibold">
                  {isSubmittingSpecs && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Specifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Fruit */}
      {isNewFruitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-heading font-bold text-lg text-foreground">Add New Produce / Fruit</h3>
              <button onClick={() => setIsNewFruitModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFruit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Common Fruit Name</label>
                <Input 
                  required
                  placeholder="e.g. Alphonso Mango, Nagpur Orange"
                  value={newFruitForm.name}
                  onChange={(e) => setNewFruitForm({ ...newFruitForm, name: e.target.value })}
                  className="text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Scientific Botanical Name</label>
                  <Input 
                    placeholder="e.g. Mangifera indica"
                    value={newFruitForm.scientificName}
                    onChange={(e) => setNewFruitForm({ ...newFruitForm, scientificName: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Harmonized HS Code</label>
                  <Input 
                    placeholder="080450"
                    value={newFruitForm.hsCode}
                    onChange={(e) => setNewFruitForm({ ...newFruitForm, hsCode: e.target.value })}
                    className="text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Premium Indian export harvest..."
                  value={newFruitForm.description}
                  onChange={(e) => setNewFruitForm({ ...newFruitForm, description: e.target.value })}
                  className="w-full text-xs bg-background border border-border rounded-md p-2.5 text-foreground"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsNewFruitModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingFruit} className="gap-2 font-semibold">
                  {isSubmittingFruit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Register Fruit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Variety to Fruit */}
      {newVarietyFruitId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-heading font-bold text-lg text-foreground">Add Cultivar Variety</h3>
              <button onClick={() => setNewVarietyFruitId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVariety} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Variety Name</label>
                <Input 
                  required
                  placeholder="e.g. Ratnagiri Alphonso, Kesar"
                  value={newVarietyForm.name}
                  onChange={(e) => setNewVarietyForm({ ...newVarietyForm, name: e.target.value })}
                  className="text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Export Grade</label>
                  <Input 
                    required
                    value={newVarietyForm.grade}
                    onChange={(e) => setNewVarietyForm({ ...newVarietyForm, grade: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Brix Sweetness Rating</label>
                  <Input 
                    required
                    value={newVarietyForm.brixLevel}
                    onChange={(e) => setNewVarietyForm({ ...newVarietyForm, brixLevel: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Fixed Price / kg ($)</label>
                  <Input 
                    type="number"
                    step="0.01"
                    required
                    value={newVarietyForm.pricePerKg}
                    onChange={(e) => setNewVarietyForm({ ...newVarietyForm, pricePerKg: parseFloat(e.target.value) || 0 })}
                    className="text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Available Quantity</label>
                  <Input 
                    type="number"
                    step="0.1"
                    required
                    value={newVarietyForm.availableQuantity}
                    onChange={(e) => setNewVarietyForm({ ...newVarietyForm, availableQuantity: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Min Order Qty (MOQ)</label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    value={newVarietyForm.minOrderQuantity}
                    onChange={(e) => setNewVarietyForm({ ...newVarietyForm, minOrderQuantity: parseFloat(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Unit</label>
                  <select
                    value={newVarietyForm.unit}
                    onChange={(e) => setNewVarietyForm({ ...newVarietyForm, unit: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 font-medium"
                  >
                    <option value="KG">Kilogram (KG)</option>
                    <option value="MT">Metric Ton (MT)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setNewVarietyFruitId(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingVariety} className="gap-2 font-semibold">
                  {isSubmittingVariety && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Add Variety
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
