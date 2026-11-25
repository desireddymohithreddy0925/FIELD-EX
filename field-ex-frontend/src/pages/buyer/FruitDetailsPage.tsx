import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { getFruitMedia } from '../../utils/fruitMedia';

export default function FruitDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fruit, setFruit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      buyerApi.getFruitDetails(id).then(data => {
        setFruit(data);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!fruit) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Fruit not found</h2>
        <Button variant="link" onClick={() => navigate('/buyer/catalog')}>Back to Catalog</Button>
      </div>
    );
  }

  const media = getFruitMedia(fruit.name);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/buyer/catalog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-heading font-bold">{fruit.name}</h2>
          <p className="text-muted-foreground mt-1 capitalize">{fruit.category || 'Premium Crop'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-border/60 shadow-soft bg-card">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={media.image}
                alt={media.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/60 text-white border-white/20 backdrop-blur-sm text-xs">
                  {media.grade}
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
          </Card>

          <Card className="border-border shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Produce Specs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cluster Origin</p>
                <p className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {fruit.origin || media.origin}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sweetness / Brix</p>
                <p className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-tertiary" />
                  {media.brix}
                </p>
              </div>

              {fruit.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {fruit.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Harvest Seasons</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {fruit.seasons?.map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                  {(!fruit.seasons || fruit.seasons.length === 0) && (
                    <Badge variant="secondary" className="text-xs">
                      {fruit.season || 'Year-round'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Available Varieties</CardTitle>
              <Button onClick={() => navigate(`/buyer/quotations/request?fruitId=${fruit.id}`)}>Request Quotation</Button>
            </CardHeader>
            <CardContent>
              {fruit.varieties && fruit.varieties.length > 0 ? (
                <div className="space-y-4">
                  {fruit.varieties.map((v: any) => (
                    <div key={v.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">{v.name}</h4>
                          <p className="text-sm text-muted-foreground">{v.description || 'Premium quality export grade.'}</p>
                        </div>
                        {v.active && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Available
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground">Grade</p>
                          <p className="text-sm font-medium">{v.grade || 'A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Size Range</p>
                          <p className="text-sm font-medium">{v.sizeProfile || 'Standard'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Color Profile</p>
                          <p className="text-sm font-medium">{v.colorProfile || 'Standard'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Brix Level</p>
                          <p className="text-sm font-medium">{v.brixLevel || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No varieties available for this fruit.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
