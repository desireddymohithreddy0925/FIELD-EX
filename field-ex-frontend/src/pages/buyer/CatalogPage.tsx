import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, Search, Sprout, ArrowRight, MapPin, Calendar, CheckCircle2, Filter } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function CatalogPage() {
  const navigate = useNavigate();
  const [fruits, setFruits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await buyerApi.getFruits({ size: 100 });
      setFruits(data?.content || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(fruits.map(f => f.category).filter(Boolean)))];

  const filteredFruits = fruits.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(search.toLowerCase()) || 
      (f.category && f.category.toLowerCase().includes(search.toLowerCase())) ||
      (f.origin && f.origin.toLowerCase().includes(search.toLowerCase())) ||
      (f.varieties && f.varieties.some((v: any) => v.name.toLowerCase().includes(search.toLowerCase())));
      
    const matchesCategory = selectedCategory === 'ALL' || f.category?.toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  const getFruitIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mango')) return '🥭';
    if (lower.includes('grape')) return '🍇';
    if (lower.includes('banana')) return '🍌';
    if (lower.includes('pomegranate')) return '🍎';
    if (lower.includes('orange') || lower.includes('mandarin') || lower.includes('citrus')) return '🍊';
    if (lower.includes('papaya')) return '🍈';
    if (lower.includes('guava')) return '🍐';
    if (lower.includes('apple')) return '🍏';
    return '🌱';
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Sprout className="w-3.5 h-3.5 text-tertiary" />
            <span>APEDA & GlobalGAP Certified Indian Agro-Exports</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Produce Catalog</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Export-grade fresh fruits directly aggregated from verified growers with cold-chain provenance.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search mango, grape, brix..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-background/60 border-border focus-visible:ring-tertiary"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card text-muted-foreground hover:bg-muted border border-border'
            }`}
          >
            {cat}
          </button>
        ))}
        {fruits.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            Showing {filteredFruits.length} of {fruits.length} cultivars
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Fetching verified harvest lots...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFruits.map(fruit => {
            const varieties = fruit.varieties || [];
            const seasonStr = fruit.season || (Array.isArray(fruit.seasons) ? fruit.seasons.join(', ') : 'Year-round');

            return (
              <Card 
                key={fruit.id} 
                className="overflow-hidden cursor-pointer hover:shadow-card transition-all duration-200 group border-border bg-card flex flex-col justify-between"
                onClick={() => navigate(`/buyer/catalog/${fruit.id}`)}
              >
                <div>
                  <div className="aspect-[4/3] bg-gradient-to-br from-agro-sand/80 to-agro-linen/60 flex items-center justify-center p-6 relative border-b border-border/60">
                    <span className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-200">
                      {getFruitIcon(fruit.name)}
                    </span>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <Badge variant="olive" className="text-[10px] font-semibold">
                        Grade A Export
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {fruit.name}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {fruit.category || 'Fresh Harvest'}
                        </p>
                      </div>
                      <Badge variant="wheat" className="text-[10px] shrink-0 font-medium">
                        {varieties.length} {varieties.length === 1 ? 'variety' : 'varieties'}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                      {fruit.description || 'Export-quality Indian fresh produce, harvested and packed under strict GlobalGAP phytosanitary protocols.'}
                    </p>
                    
                    <div className="mt-3.5 space-y-1.5 text-xs text-muted-foreground border-t border-border/50 pt-3">
                      {fruit.origin && (
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-tertiary shrink-0" />
                          <span className="truncate">{fruit.origin}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{seasonStr}</span>
                      </div>
                    </div>

                    {varieties.length > 0 && (
                      <div className="mt-3 pt-2 flex flex-wrap gap-1">
                        {varieties.slice(0, 3).map((v: any) => (
                          <span key={v.id} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            {v.name}
                          </span>
                        ))}
                        {varieties.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            +{varieties.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="px-5 pb-4 pt-2 flex items-center justify-between border-t border-border/60 text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pre-inspected
                  </span>
                  <span className="font-semibold text-primary group-hover:text-secondary flex items-center gap-1 transition-colors">
                    Specifications <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}

          {filteredFruits.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground border rounded-2xl border-dashed border-border bg-card">
              <Sprout className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-base font-heading font-semibold text-foreground">No produce matches your query</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching for other fruits or view all available varieties.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSearch(''); setSelectedCategory('ALL'); }}
                className="mt-4"
              >
                Clear Search Filter
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
