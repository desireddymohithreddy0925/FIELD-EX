import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Globe, Box, Sparkles, Plus, CheckCircle2, 
  Calendar, Thermometer, FileCheck, Search, Loader2
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { buyerApi } from '../../services/buyerApi';

interface VarietyViewItem {
  id: string;
  fruitId: string;
  fruit: string;
  variety: string;
  category: string;
  origin: string;
  season: string;
  shelfLife: string;
  storageTemp: string;
  brix: string;
  grade: string;
  sizeProfile: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export default function EditorDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fruits, setFruits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isAddFruitOpen, setIsAddFruitOpen] = useState(false);
  const [isAddVarietyOpen, setIsAddVarietyOpen] = useState(false);

  // Form states
  const [fruitForm, setFruitForm] = useState({
    name: '',
    category: 'Tropical',
    origin: '',
    season: '',
    description: '',
  });

  const [varietyForm, setVarietyForm] = useState({
    fruitId: '',
    name: '',
    grade: 'Grade A (Export Caliber)',
    brixLevel: '16-18° Brix',
    sizeProfile: 'Standard Export Caliber',
    minStorageTemperature: 4.0,
    maxStorageTemperature: 8.0,
    shelfLifeDays: 28,
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await buyerApi.getFruits({ size: 100 });
      const list = data?.content || (Array.isArray(data) ? data : []);
      setFruits(list);
    } catch (err) {
      console.error("Failed to load catalog in editor:", err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten fruits + varieties into displayable table rows
  const produceList: VarietyViewItem[] = [];
  fruits.forEach(f => {
    if (f.varieties && f.varieties.length > 0) {
      f.varieties.forEach((v: any) => {
        produceList.push({
          id: v.id,
          fruitId: f.id,
          fruit: f.name,
          variety: v.name,
          category: f.category || 'Agricultural Crop',
          origin: f.origin || 'India Agricultural Cluster',
          season: f.season || 'Seasonal',
          shelfLife: v.shelfLifeDays ? `${v.shelfLifeDays} Days` : '30 Days',
          storageTemp: (v.minStorageTemperature !== null && v.maxStorageTemperature !== null) 
            ? `+${v.minStorageTemperature}°C to +${v.maxStorageTemperature}°C` 
            : '+2°C to +8°C',
          brix: v.brixLevel || 'Export Caliber',
          grade: v.grade || 'Grade A Export',
          sizeProfile: v.sizeProfile || 'Standard',
          status: v.active !== false ? 'PUBLISHED' : 'DRAFT',
        });
      });
    } else {
      // Fruit without varieties yet
      produceList.push({
        id: f.id,
        fruitId: f.id,
        fruit: f.name,
        variety: '— (No varieties cataloged)',
        category: f.category || 'Crop',
        origin: f.origin || 'India',
        season: f.season || 'Seasonal',
        shelfLife: '—',
        storageTemp: '—',
        brix: '—',
        grade: '—',
        sizeProfile: '—',
        status: f.active !== false ? 'PUBLISHED' : 'DRAFT',
      });
    }
  });

  const filtered = produceList.filter(item => 
    item.fruit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFruit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fruitForm.name.trim()) return;
    try {
      setIsSubmitting(true);
      await buyerApi.createFruit(fruitForm);
      setIsAddFruitOpen(false);
      setFruitForm({ name: '', category: 'Tropical', origin: '', season: '', description: '' });
      await fetchData();
    } catch (err) {
      console.error("Failed to create fruit:", err);
      alert("Failed to create fruit. Please check permissions or network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateVariety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varietyForm.fruitId || !varietyForm.name.trim()) return;
    try {
      setIsSubmitting(true);
      await buyerApi.createVariety(varietyForm.fruitId, {
        name: varietyForm.name,
        grade: varietyForm.grade,
        brixLevel: varietyForm.brixLevel,
        sizeProfile: varietyForm.sizeProfile,
        minStorageTemperature: Number(varietyForm.minStorageTemperature),
        maxStorageTemperature: Number(varietyForm.maxStorageTemperature),
        shelfLifeDays: Number(varietyForm.shelfLifeDays),
        description: varietyForm.description,
        active: true,
      });
      setIsAddVarietyOpen(false);
      setVarietyForm({
        fruitId: '',
        name: '',
        grade: 'Grade A (Export Caliber)',
        brixLevel: '16-18° Brix',
        sizeProfile: 'Standard Export Caliber',
        minStorageTemperature: 4.0,
        maxStorageTemperature: 8.0,
        shelfLifeDays: 28,
        description: '',
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to create variety:", err);
      alert("Failed to create variety. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVarietiesCount = fruits.reduce((acc, f) => acc + (f.varieties?.length || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5 text-tertiary" />
            <span>Catalog Curation & Produce Metadata</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Catalog Editor Console</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Maintain export produce listings, variety profiles, temperature thresholds, and harvest availability calendars.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button size="sm" variant="outline" onClick={() => setIsAddFruitOpen(true)} className="gap-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> Add Fruit Cultivar
          </Button>
          <Button size="sm" onClick={() => setIsAddVarietyOpen(true)} className="gap-1.5 text-xs font-semibold shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Variety Spec
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Produce Lines</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Globe className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">
              {loading ? '...' : `${fruits.length} Produce Lines`}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Export-cleared commercial categories</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Varieties</CardTitle>
            <div className="p-2 rounded-lg bg-agro-olive/15 text-tertiary">
              <Box className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">
              {loading ? '...' : `${totalVarietiesCount} Varieties`}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Full APEDA & GlobalGAP specifications</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cold Guidelines</CardTitle>
            <div className="p-2 rounded-lg bg-agro-wheat/20 text-agro-ochre">
              <Thermometer className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">100% Calibrated</div>
            <p className="text-xs text-muted-foreground mt-1">Storage temp & shelf-life matrices verified</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Harvest Seasons</CardTitle>
            <div className="p-2 rounded-lg bg-agro-clay/15 text-agro-clay">
              <Calendar className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">2026/27 Active</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Live spot and contract quoting enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table: Produce Catalog Editor */}
      <Card className="border-border shadow-soft bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-heading font-bold text-foreground">Produce & Variety Catalog</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Live specifications synchronized to international buyers and internal operations</p>
          </div>
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search fruit, variety, or origin..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-xs">Loading live produce catalog...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Produce / Cultivar</th>
                    <th className="py-3 px-4">Variety Name</th>
                    <th className="py-3 px-4">Category & Origin</th>
                    <th className="py-3 px-4">Harvest Season</th>
                    <th className="py-3 px-4">Storage Temp</th>
                    <th className="py-3 px-4">Brix Rating</th>
                    <th className="py-3 px-4">Grade & Caliber</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {item.fruit}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-primary">{item.variety}</div>
                        <div className="text-[11px] text-muted-foreground">Shelf Life: {item.shelfLife}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-foreground font-medium">{item.category}</div>
                        <div className="text-[11px] text-muted-foreground">{item.origin}</div>
                      </td>
                      <td className="py-3.5 px-4 text-foreground font-medium">{item.season}</td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">{item.storageTemp}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="wheat" className="text-[10px] font-semibold">{item.brix}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{item.grade}</div>
                        <div className="text-[10px] text-muted-foreground">{item.sizeProfile}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={item.status === 'PUBLISHED' ? 'forest' : 'clay'} className="text-[10px] uppercase">
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No produce varieties match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidelines Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-soft bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-heading font-bold text-foreground">GlobalGAP & APEDA Verification Guidelines</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Produce specifications must comply with mandatory export norms</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p><strong className="text-foreground">Brix Rating Validation:</strong> Always measure sugar content using calibrated refractometers at 20°C prior to logging catalog specifications.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p><strong className="text-foreground">Shelf Life Parameters:</strong> Shelf life must reflect controlled atmosphere reefer conditions (+0.5°C to +13°C depending on produce variety).</p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p><strong className="text-foreground">Pesticide Residue Free (MRL):</strong> Ensure all variety origin groves hold valid testing certificates under European & Gulf phytosanitary regulations.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-heading font-bold text-foreground">Packaging & Palletization Protocols</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Carton dimensions and tare weights configured for reefer transport</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p><strong className="text-foreground">Standard 3.5kg Mango Corrugated Boxes:</strong> 8-12 count export trays with individual foam sleeves and ventilated side holes.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p><strong className="text-foreground">13.5kg / 18kg Banana Telescopic Cartons:</strong> Polyethylene liner bag with ethylene absorber packets for overseas transit.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p><strong className="text-foreground">5kg Pomegranate Cartons:</strong> 9-14 count red aril export grade with moisture barrier separators.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Add Fruit Cultivar */}
      <Dialog open={isAddFruitOpen} onOpenChange={setIsAddFruitOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add New Produce Cultivar</DialogTitle>
            <DialogDescription>
              Register a new fruit category in the FIELD-EX export catalog.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFruit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Fruit Name *</Label>
              <Input 
                placeholder="e.g. Nagpur Mandarin, Guava" 
                value={fruitForm.name} 
                onChange={(e) => setFruitForm({...fruitForm, name: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Input 
                  placeholder="e.g. Citrus, Tropical" 
                  value={fruitForm.category} 
                  onChange={(e) => setFruitForm({...fruitForm, category: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Harvest Season</Label>
                <Input 
                  placeholder="e.g. October - March" 
                  value={fruitForm.season} 
                  onChange={(e) => setFruitForm({...fruitForm, season: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Growing Origin / Cluster</Label>
              <Input 
                placeholder="e.g. Vidarbha, Maharashtra" 
                value={fruitForm.origin} 
                onChange={(e) => setFruitForm({...fruitForm, origin: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input 
                placeholder="Brief export quality notes" 
                value={fruitForm.description} 
                onChange={(e) => setFruitForm({...fruitForm, description: e.target.value})} 
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddFruitOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Fruit Cultivar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Add Variety Spec */}
      <Dialog open={isAddVarietyOpen} onOpenChange={setIsAddVarietyOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Variety Specification</DialogTitle>
            <DialogDescription>
              Configure export grade, Brix rating, and storage requirements for a cultivar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVariety} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Parent Fruit *</Label>
              <Select value={varietyForm.fruitId} onValueChange={(val) => setVarietyForm({...varietyForm, fruitId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fruit cultivar" />
                </SelectTrigger>
                <SelectContent>
                  {fruits.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name} ({f.category})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Variety Name *</Label>
              <Input 
                placeholder="e.g. Alphonso (Hapus), Bhagwa" 
                value={varietyForm.name} 
                onChange={(e) => setVarietyForm({...varietyForm, name: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Export Grade</Label>
                <Input 
                  placeholder="Grade A (Export Caliber)" 
                  value={varietyForm.grade} 
                  onChange={(e) => setVarietyForm({...varietyForm, grade: e.target.value})} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Brix Sugar Rating</Label>
                <Input 
                  placeholder="e.g. 18-20° Brix" 
                  value={varietyForm.brixLevel} 
                  onChange={(e) => setVarietyForm({...varietyForm, brixLevel: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min Temp (°C)</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  value={varietyForm.minStorageTemperature} 
                  onChange={(e) => setVarietyForm({...varietyForm, minStorageTemperature: parseFloat(e.target.value) || 0})} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Temp (°C)</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  value={varietyForm.maxStorageTemperature} 
                  onChange={(e) => setVarietyForm({...varietyForm, maxStorageTemperature: parseFloat(e.target.value) || 0})} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Shelf Life (Days)</Label>
                <Input 
                  type="number" 
                  value={varietyForm.shelfLifeDays} 
                  onChange={(e) => setVarietyForm({...varietyForm, shelfLifeDays: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Calibration / Size Profile</Label>
              <Input 
                placeholder="e.g. 220g - 280g / fruit, 18-22mm caliber" 
                value={varietyForm.sizeProfile} 
                onChange={(e) => setVarietyForm({...varietyForm, sizeProfile: e.target.value})} 
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddVarietyOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !varietyForm.fruitId || !varietyForm.name.trim()}>
                {isSubmitting ? 'Saving...' : 'Add Variety'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
