import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { buyerApi } from '../../services/buyerApi';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';

export default function RequestQuotationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFruitId = searchParams.get('fruitId') || '';
  const initialVarietyId = searchParams.get('varietyId') || '';

  const [loading, setLoading] = useState(false);
  const [fruits, setFruits] = useState<any[]>([]);
  const [items, setItems] = useState([
    { fruitId: initialFruitId, varietyId: initialVarietyId, quantity: 1000 }
  ]);

  useEffect(() => {
    const fetchCatalog = () => {
      buyerApi.getFruits({ size: 100 }).then(data => {
        const list = data?.content || (Array.isArray(data) ? data : []);
        setFruits(list);
      }).catch(console.error);
    };
    fetchCatalog();
    const timer = setInterval(fetchCatalog, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleAddItem = () => {
    setItems([...items, { fruitId: '', varietyId: '', quantity: 1000 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    if (field === 'fruitId') {
      newItems[index].varietyId = ''; // reset variety when fruit changes
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate
      if (items.some(i => !i.fruitId || !i.varietyId || i.quantity <= 0)) {
        alert("Please complete all fields with valid quantities.");
        setLoading(false);
        return;
      }
      
      const res = await buyerApi.requestQuotation({ items });
      navigate(`/buyer/quotations/${res.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to request quotation.");
    } finally {
      setLoading(false);
    }
  };

  const estimatedPresentTotal = items.reduce((sum, item) => {
    const fruit = fruits.find(f => f.id === item.fruitId);
    const variety = fruit?.varieties?.find((v: any) => v.id === item.varietyId);
    const unitPrice = variety?.pricePerKg != null ? Number(variety.pricePerKg) : 0;
    return sum + unitPrice * (Number(item.quantity) || 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/buyer/quotations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-heading font-bold">Request Quotation</h2>
          <p className="text-muted-foreground mt-1">Select fruits and quantities; present amounts reflect live Admin & Manager fixed variety prices.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Items & Live Present Valuation</CardTitle>
            <CardDescription>Add fruit varieties and quantities to view real-time estimated amounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {items.map((item, index) => {
              const selectedFruit = fruits.find(f => f.id === item.fruitId);
              const varieties = selectedFruit?.varieties || [];
              const selectedVariety = varieties.find((v: any) => v.id === item.varietyId);
              const unitPrice = selectedVariety?.pricePerKg != null ? Number(selectedVariety.pricePerKg) : null;
              const lineAmount = unitPrice != null ? unitPrice * (Number(item.quantity) || 0) : null;

              return (
                <div key={index} className="p-4 border rounded-lg bg-muted/20 space-y-3">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Fruit</Label>
                      <Select value={item.fruitId} onValueChange={(val) => handleItemChange(index, 'fruitId', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fruit" />
                        </SelectTrigger>
                        <SelectContent>
                          {fruits.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label>Variety</Label>
                      <Select disabled={!item.fruitId} value={item.varietyId} onValueChange={(val) => handleItemChange(index, 'varietyId', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variety" />
                        </SelectTrigger>
                        <SelectContent>
                          {varieties.map((v: any) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}{v.pricePerKg != null ? ` (${v.currency || 'USD'} $${Number(v.pricePerKg).toFixed(2)}/kg)` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:w-36 space-y-2">
                      <Label>Quantity (kg)</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} 
                      />
                    </div>

                    {items.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {selectedVariety && (
                    <div className="pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <span>
                          Fixed Rate: <strong className="font-mono text-foreground">{unitPrice != null ? `${selectedVariety.currency || 'USD'} $${unitPrice.toFixed(2)}/kg` : 'Pending Admin Rate'}</strong>
                        </span>
                        <span>
                          Available: <strong className="text-foreground">{Number(selectedVariety.availableQuantity ?? 0).toLocaleString()} {selectedVariety.unit || 'KG'}</strong>
                        </span>
                        <span>
                          MOQ: <strong className="text-foreground">{Number(selectedVariety.minOrderQuantity ?? 500).toLocaleString()} {selectedVariety.unit || 'KG'}</strong>
                        </span>
                      </div>
                      {lineAmount != null && (
                        <div className="font-mono font-bold text-primary text-sm">
                          Present Line Amount: {selectedVariety.currency || 'USD'} ${lineAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/50 border-t p-6">
            <div>
              <span className="text-xs text-muted-foreground block">Estimated Present Amount (per Admin/Manager rates)</span>
              <span className="text-xl font-heading font-extrabold text-primary font-mono">
                USD ${estimatedPresentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
