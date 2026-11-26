import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, Search, Sprout, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function CatalogPage() {
  const navigate = useNavigate();
  const [fruits, setFruits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await buyerApi.getFruits({ size: 100 });
      setFruits(data?.content || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFruits = fruits.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getFruitIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mango')) return '🥭';
    if (lower.includes('grape')) return '🍇';
    if (lower.includes('banana')) return '🍌';
    if (lower.includes('pomegranate')) return '🍎';
    if (lower.includes('orange') || lower.includes('citrus')) return '🍊';
    if (lower.includes('guava') || lower.includes('papaya')) return '🍈';
    return '🌱';
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Sprout className="w-3 h-3 text-tertiary" />
            <span>APEDA & GlobalGAP Certified Produce</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Produce Catalog</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Export-grade fresh fruits directly aggregated from verified Indian agricultural clusters.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search mango, grape, banana..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-background/60 border-border focus-visible:ring-tertiary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Fetching verified harvest lots...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFruits.map(fruit => (
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
                  <div className="absolute top-3 right-3">
                    <Badge variant="olive" className="text-[10px] font-semibold">
                      Export Grade
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
                        {fruit.category || 'Agricultural Crop'}
                      </p>
                    </div>
                    <Badge variant="wheat" className="text-[10px] shrink-0 font-medium">
                      {fruit.varieties?.length || 0} varieties
                    </Badge>
                  </div>
                  
                  {fruit.seasons && fruit.seasons.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {fruit.seasons.slice(0, 2).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                          {s}
                        </span>
                      ))}
                      {fruit.seasons.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                          +{fruit.seasons.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-border/60 text-xs">
                <span className="text-muted-foreground font-medium">Brix & QC Pre-tested</span>
                <span className="font-semibold text-primary group-hover:text-secondary flex items-center gap-1 transition-colors">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}

          {filteredFruits.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground border rounded-2xl border-dashed border-border bg-card">
              <Sprout className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-base font-heading font-semibold text-foreground">No produce matches your query</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching for other fruits or view all available varieties.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearch('')}
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
