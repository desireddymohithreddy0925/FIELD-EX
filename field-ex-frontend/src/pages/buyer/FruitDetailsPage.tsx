import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Loader2, ArrowLeft, CheckCircle2, MapPin, Calendar, 
  Thermometer, Clock, ShieldCheck, Send 
} from 'lucide-react';
import { getFruitMedia } from '../../utils/fruitMedia';

export default function FruitDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fruit, setFruit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      buyerApi.getFruitDetails(id)
        .then(data => setFruit(data))
        .catch(err => console.error("Error fetching fruit:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Retrieving harvest lot specifications...</p>
      </div>
    );
  }

  if (!fruit) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-3xl">
          🔍
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Produce Item Not Found</h2>
        <p className="text-sm text-muted-foreground">The selected fruit cultivar does not exist or has been archived.</p>
        <Button onClick={() => navigate('/buyer/catalog')} variant="outline">
          Return to Produce Catalog
        </Button>
      </div>
    );
  }

  const seasonStr = fruit.season || (Array.isArray(fruit.seasons) ? fruit.seasons.join(', ') : 'Year-round');
  const varieties = fruit.varieties || [];
  const media = getFruitMedia(fruit.name);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/buyer/catalog')}
          className="gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
        </Button>

        <Button 
          onClick={() => navigate(`/buyer/quotations/request?fruitId=${fruit.id}`)}
          className="gap-2 font-semibold text-xs shadow-sm"
        >
          <Send className="w-3.5 h-3.5" /> Request Quotation
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Hero Icon & Origin Details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-border bg-card">
            <div className="aspect-square relative overflow-hidden bg-muted border-b border-border">
              <img
                src={media.image}
                alt={media.alt || fruit.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 right-3">
                <Badge variant="olive" className="text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm border-white/20">
                  GlobalGAP Certified
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="font-semibold bg-black/50 px-2.5 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-agro-wheat" />
                  {fruit.origin ? fruit.origin.split(',')[0] : media.origin.split(',')[0]}
                </span>
                <span className="font-semibold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded backdrop-blur-sm text-[11px]">
                  {media.highlight}
                </span>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-foreground">{fruit.name}</h1>
                <p className="text-xs font-semibold text-primary capitalize mt-0.5">{fruit.category || 'Tropical Produce'}</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {fruit.description || 'Export-grade Indian fresh fruit produced under stringent quality guidelines and phytosanitary traceability.'}
              </p>

              <div className="space-y-2.5 pt-3 border-t border-border text-xs">
                {fruit.origin && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground block">Harvest Origin</span>
                      <span>{fruit.origin}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Harvest Window</span>
                    <span>{seasonStr}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Compliance</span>
                    <span>APEDA Phytosanitary & MRL Tested</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Varieties List */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-border">
              <div>
                <CardTitle className="text-lg font-heading font-bold">Export Cultivars & Varieties</CardTitle>
                <CardDescription className="text-xs">
                  {varieties.length} export-grade varieties available for international commercial contracts
                </CardDescription>
              </div>
              <Badge variant="wheat" className="text-xs font-semibold">
                {varieties.length} Varieties
              </Badge>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {varieties.length > 0 ? (
                varieties.map((v: any) => (
                  <div 
                    key={v.id} 
                    className="p-5 border border-border rounded-xl bg-card hover:border-primary/50 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-lg text-foreground">{v.name}</h3>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Active Export
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {v.description || 'Premium export caliber selected for maximum shelf stability and sweet flavor.'}
                        </p>
                      </div>

                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/buyer/quotations/request?fruitId=${fruit.id}&varietyId=${v.id}`)}
                        className="text-xs font-semibold shrink-0 gap-1.5"
                      >
                        <Send className="w-3 h-3" /> Quote Variety
                      </Button>
                    </div>

                    {/* Spec Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/60 text-xs">
                      <div className="p-2.5 rounded-lg bg-muted/40">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Export Grade
                        </span>
                        <span className="font-semibold text-foreground mt-0.5 block truncate">
                          {v.grade || 'Grade A Export'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Brix Sugar
                        </span>
                        <span className="font-semibold text-primary mt-0.5 block truncate">
                          {v.brixLevel || '16-18° Brix'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Calibration / Size
                        </span>
                        <span className="font-semibold text-foreground mt-0.5 block truncate">
                          {v.sizeProfile || 'Standard Export Caliber'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Storage Temp
                        </span>
                        <span className="font-semibold text-foreground mt-0.5 block truncate flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-tertiary" />
                          {v.minStorageTemperature !== null && v.maxStorageTemperature !== null 
                            ? `+${v.minStorageTemperature}°C to +${v.maxStorageTemperature}°C`
                            : '+2°C to +8°C'}
                        </span>
                      </div>
                    </div>

                    {v.shelfLifeDays && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Reefer shelf life: <strong>{v.shelfLifeDays} days</strong> under controlled atmosphere</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed rounded-xl border-border">
                  <p className="text-sm text-muted-foreground">No varieties currently cataloged for this fruit cultivar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
