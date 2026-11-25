import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Globe, Box, Sparkles, Plus, Edit3, CheckCircle2, 
  Calendar, Thermometer, FileCheck, Search
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface ProduceItem {
  id: string;
  fruit: string;
  variety: string;
  category: string;
  origin: string;
  season: string;
  shelfLife: string;
  storageTemp: string;
  brix: string;
  status: 'PUBLISHED' | 'DRAFT' | 'SEASONAL';
}

const initialProduceList: ProduceItem[] = [
  {
    id: 'FRT-01',
    fruit: 'Mango',
    variety: 'Alphonso (Hapus)',
    category: 'Tropical',
    origin: 'Ratnagiri & Devgad, Maharashtra',
    season: 'March - June',
    shelfLife: '18 Days',
    storageTemp: '10°C - 13°C',
    brix: '18-20° Brix',
    status: 'PUBLISHED',
  },
  {
    id: 'FRT-02',
    fruit: 'Mango',
    variety: 'Kesar',
    category: 'Tropical',
    origin: 'Junagadh & Aurangabad',
    season: 'April - July',
    shelfLife: '21 Days',
    storageTemp: '11°C - 13°C',
    brix: '19-21° Brix',
    status: 'PUBLISHED',
  },
  {
    id: 'FRT-03',
    fruit: 'Pomegranate',
    variety: 'Bhagwa',
    category: 'Exotic',
    origin: 'Solapur & Nashik, Maharashtra',
    season: 'August - February',
    shelfLife: '60 Days',
    storageTemp: '5°C - 7°C',
    brix: '15-17° Brix',
    status: 'PUBLISHED',
  },
  {
    id: 'FRT-04',
    fruit: 'Banana',
    variety: 'Grand Naine (G9)',
    category: 'Tropical',
    origin: 'Jalgaon, Maharashtra & Theni, TN',
    season: 'Year-Round',
    shelfLife: '28 Days',
    storageTemp: '13°C - 14°C',
    brix: 'High Caliber',
    status: 'PUBLISHED',
  },
  {
    id: 'FRT-05',
    fruit: 'Grape',
    variety: 'Thompson Seedless',
    category: 'Sub-Tropical',
    origin: 'Nashik & Sangli, Maharashtra',
    season: 'December - April',
    shelfLife: '45 Days',
    storageTemp: '-0.5°C - 0.5°C',
    brix: '16-18° Brix',
    status: 'SEASONAL',
  },
];

export default function EditorDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [produceList] = useState<ProduceItem[]>(initialProduceList);

  const filtered = produceList.filter(item => 
    item.fruit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.origin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Sparkles className="w-3 h-3 text-tertiary" />
            <span>Catalog Curation & Produce Metadata</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Catalog Editor Console</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Maintain export produce listings, variety profiles, temperature thresholds, and harvest availability calendars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="clay" className="px-3 py-1 text-xs">
            Role: Produce Editor
          </Badge>
          <Button size="sm" className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add Produce Variety
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border shadow-soft bg-card hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Produce Lines</CardTitle>
            <div className="p-2 rounded-lg bg-agro-forest/10 text-primary">
              <Globe className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">5 Produce Lines</div>
            <p className="text-xs text-tertiary font-medium mt-1">Export-cleared commercial varieties</p>
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
            <div className="text-2xl font-heading font-bold text-foreground">12 Varieties</div>
            <p className="text-xs text-tertiary font-medium mt-1">Full APEDA & GlobalGAP specifications</p>
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
            <p className="text-xs text-muted-foreground mt-1">Temperature & humidity matrices verified</p>
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
            <div className="text-2xl font-heading font-bold text-foreground">2026 Season Active</div>
            <p className="text-xs text-tertiary font-medium mt-1">Live spot and contract quoting enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table: Produce Catalog Editor */}
      <Card className="border-border shadow-soft bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-heading font-bold text-foreground">Produce & Variety Catalog</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Live specifications visible to international buyers and internal operations</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Produce / Variety</th>
                  <th className="py-3 px-4">Category & Origin</th>
                  <th className="py-3 px-4">Harvest Season</th>
                  <th className="py-3 px-4">Storage Temp</th>
                  <th className="py-3 px-4">Brix Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">{item.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{item.variety}</div>
                      <div className="text-[11px] text-muted-foreground">{item.fruit}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-foreground">{item.category}</div>
                      <div className="text-[11px] text-muted-foreground">{item.origin}</div>
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">{item.season}</td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">{item.storageTemp}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="wheat" className="text-[10px] font-semibold">{item.brix}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={item.status === 'PUBLISHED' ? 'forest' : 'clay'} className="text-[10px] uppercase">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-medium">
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Specs
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Editorial Guidelines & Standards */}
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
    </div>
  );
}
