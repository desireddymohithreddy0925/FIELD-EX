import { useState, useEffect } from 'react';
import { buyerApi } from '../../services/buyerApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Bell, Loader2, Calendar, AlertTriangle, Package, Ship } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await buyerApi.getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-5 h-5 text-primary" />;
      case 'SHIPMENT':
      case 'DELIVERY':
        return <Ship className="w-5 h-5 text-indigo-600" />;
      case 'DELAYED_SHIPMENT':
      case 'LOW_INVENTORY':
      case 'NEAR_EXPIRY':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Badge variant="olive">Order</Badge>;
      case 'SHIPMENT':
        return <Badge variant="wheat">Shipment</Badge>;
      case 'DELIVERY':
        return <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">Delivered</Badge>;
      case 'DELAYED_SHIPMENT':
        return <Badge variant="destructive">Delayed</Badge>;
      default:
        return <Badge variant="outline">{type || 'Alert'}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Retrieving your notification feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <Bell className="w-3 h-3 text-tertiary" />
            <span>Fulfillment Telemetry & Alerts</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Notifications</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Real-time status updates on quotations, cold storage dispatch, customs, and deliveries.
          </p>
        </div>
        <Button variant="outline" onClick={fetchNotifications} size="sm">
          Refresh
        </Button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className="border-border hover:shadow-card transition-all">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-accent shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-semibold text-sm text-foreground truncate">
                      {n.subject}
                    </h4>
                    {getNotificationBadge(n.type)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-4">
              <Bell className="w-16 h-16 text-muted-foreground/40" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground">You're All Caught Up!</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              No unread notifications. We will notify you when quotations receive pricing or when your export consignments change transit status.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
