import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, ArrowLeft, Package, FileText, Anchor, Truck, CheckCircle, Download } from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const orderData = await buyerApi.getOrderDetails(id);
      setOrder(orderData);

      try {
        const docs = await buyerApi.getOrderDocuments(id);
        setDocuments(Array.isArray(docs) ? docs : []);
      } catch (e) {
        // Documents not generated yet or access not ready
      }

      try {
        const shipData = await buyerApi.getOrderShipments(id);
        if (shipData && shipData.id) {
          setShipment(shipData);
        }
      } catch (e) {
        // Shipment not created yet
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button variant="link" onClick={() => navigate('/buyer/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAYMENT_PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PACKED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DISPATCHED':
      case 'IN_TRANSIT': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'CUSTOMS': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const timelineSteps = [
    { label: 'Order Confirmed', icon: Package, status: 'completed' },
    { 
      label: 'Packaging', 
      icon: Package, 
      status: ['PROCESSING', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED'].includes(order.status) ? 'completed' : 'pending' 
    },
    { 
      label: 'Documentation', 
      icon: FileText, 
      status: ['PACKED', 'DISPATCHED', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED'].includes(order.status) || documents.length > 0 ? 'completed' : 'pending' 
    },
    { 
      label: 'Shipment', 
      icon: Anchor, 
      status: ['DISPATCHED', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED'].includes(order.status) || (shipment && shipment.status !== 'PREPARING') ? 'completed' : 'pending' 
    },
    { 
      label: 'Customs Clearance', 
      icon: CheckCircle, 
      status: ['CUSTOMS', 'DELIVERED'].includes(order.status) ? 'completed' : 'pending' 
    },
    { 
      label: 'Delivery', 
      icon: Truck, 
      status: order.status === 'DELIVERED' ? 'completed' : 'pending' 
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/buyer/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-heading font-bold">
            Order #{order.orderNumber || order.id?.split('-')[0].toUpperCase()}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Timeline Component */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment & Fulfillment Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between relative px-4 md:px-12 py-8">
            <div className="absolute left-1/2 md:left-12 top-0 md:top-1/2 bottom-0 md:bottom-auto w-0.5 md:w-auto md:h-0.5 bg-border -translate-x-1/2 md:-translate-y-1/2 md:translate-x-0 md:right-12 z-0 hidden md:block" />
            
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = step.status === 'completed';
              return (
                <div key={idx} className="flex flex-col items-center relative z-10 w-full md:w-auto mb-8 md:mb-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'} transition-colors`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <p className={`mt-3 text-xs md:text-sm font-medium ${isCompleted ? 'text-primary' : 'text-muted-foreground'} text-center`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Consignment Lots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {order.items && order.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{item.fruitName || 'Produce'}</p>
                      <p className="text-xs text-muted-foreground">{item.varietyName || 'Export Variety'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{item.quantity} KG</p>
                      {item.unitPrice && (
                        <p className="text-xs text-muted-foreground">
                          {order.currencyCode} {item.unitPrice} / KG
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipment Details if present */}
          {shipment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-primary" />
                  Freight Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Container:</span>
                    <p className="font-mono text-sm font-semibold">{shipment.containerNumber || 'Assigned'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tracking Number:</span>
                    <p className="font-mono text-sm font-semibold">{shipment.trackingNumber || 'Active'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Port of Origin:</span>
                    <p className="font-semibold">{shipment.originPort || 'JNPT Port'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Destination Port:</span>
                    <p className="font-semibold">{shipment.destinationPort || 'International Port'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center font-bold text-lg border-b pb-4">
                  <span>Total Amount</span>
                  <span className="text-primary">{order.currencyCode || 'USD'} {order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <p className="font-medium">Payment Terms</p>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{order.paymentTerms || 'Confirmed Letter of Credit (LC) / Wire Transfer'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.quotationId && (
                  <Button variant="outline" className="w-full justify-start text-xs" onClick={() => navigate(`/buyer/quotations/${order.quotationId}`)}>
                    <FileText className="w-4 h-4 mr-2 text-primary" />
                    View Original Quotation
                  </Button>
                )}

                {documents.length > 0 ? (
                  documents.map((doc: any) => (
                    <Button 
                      key={doc.id}
                      variant="outline" 
                      className="w-full justify-between text-xs" 
                      onClick={() => doc.downloadUrl && window.open(doc.downloadUrl, '_blank')}
                      disabled={!doc.downloadUrl}
                    >
                      <span className="flex items-center truncate">
                        <FileText className="w-4 h-4 mr-2 text-primary shrink-0" />
                        <span className="truncate">{doc.filename || doc.type}</span>
                      </span>
                      {doc.downloadUrl && <Download className="w-3.5 h-3.5 shrink-0 ml-2" />}
                    </Button>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                    <p>Documents pending generation.</p>
                    <p className="text-[11px] mt-1">Generated during export packing.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
