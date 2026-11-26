import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, Truck, 
  RefreshCw, Search, FileText
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { adminApi, type CalendarEventDto } from '../../services/adminApi';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getCalendarEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesFilter = filterType === 'ALL' || e.eventType === filterType;
    const matchesSearch = 
      (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.orderNumber && e.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.buyerName && e.buyerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.details && e.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getEventBadgeClass = (badgeColor?: string) => {
    switch (badgeColor) {
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cyan': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Group events by date string (YYYY-MM-DD)
  const groupedEvents: { [dateStr: string]: CalendarEventDto[] } = {};
  filteredEvents.forEach(e => {
    const dateKey = e.date ? new Date(e.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Unscheduled';
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(e);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <CalendarIcon className="w-3.5 h-3.5 text-tertiary" />
            <span>Operational Calendar API</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">Operations & Milestones Calendar</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Complete lifecycle timeline: tracking order placement dates, packhouse packing, export dispatch, vessel transit, and consignee receipt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchEvents} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-soft bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
            <span>Orders Placed</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mt-2">
            {events.filter(e => e.eventType === 'ORDER_PLACED').length}
          </div>
        </Card>

        <Card className="border-border shadow-soft bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
            <span>Dispatched / Port</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mt-2">
            {events.filter(e => e.eventType === 'SHIPMENT_DISPATCHED' || e.eventType === 'VESSEL_DEPARTED').length}
          </div>
        </Card>

        <Card className="border-border shadow-soft bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
            <span>Customs & ETA</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mt-2">
            {events.filter(e => e.eventType === 'CUSTOMS_CLEARED' || e.eventType === 'EXPECTED_DELIVERY').length}
          </div>
        </Card>

        <Card className="border-border shadow-soft bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
            <span>Delivered / Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mt-2">
            {events.filter(e => e.eventType === 'ORDER_DELIVERED' || e.eventType === 'DELIVERY_CONFIRMED').length}
          </div>
        </Card>
      </div>

      {/* Search & Event Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Search order #, buyer, tracking..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { label: 'All Milestones', value: 'ALL' },
            { label: 'Orders Placed', value: 'ORDER_PLACED' },
            { label: 'Payments', value: 'PAYMENT_CONFIRMED' },
            { label: 'Packhouse', value: 'PACKING_COMPLETE' },
            { label: 'Dispatches', value: 'SHIPMENT_DISPATCHED' },
            { label: 'Port ETA', value: 'EXPECTED_DELIVERY' },
            { label: 'Delivered', value: 'ORDER_DELIVERED' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Event Feed */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading operational timeline...
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm bg-card rounded-2xl border border-border">
            No milestones or orders found matching your filter criteria.
          </div>
        ) : (
          Object.entries(groupedEvents).map(([dateLabel, dateEvents]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-sm text-foreground">{dateLabel}</h3>
                <span className="text-xs text-muted-foreground font-mono">({dateEvents.length} events)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dateEvents.map(evt => (
                  <Card key={evt.id} className="border-border shadow-soft bg-card hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getEventBadgeClass(evt.badgeColor)}`}>
                            {evt.eventType.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {evt.date ? new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>

                        <h4 className="font-heading font-bold text-sm text-foreground">
                          {evt.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {evt.details}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{evt.buyerName}</span>
                        <span className="font-mono">{evt.orderNumber}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
