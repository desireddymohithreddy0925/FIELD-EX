import { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon, Clock, CheckCircle2, Truck,
  RefreshCw, Search, FileText, ChevronLeft, ChevronRight, List, Grid
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { adminApi, type CalendarEventDto } from '../../services/adminApi';

const FILTER_OPTIONS = [
  { label: 'All Milestones', types: [] as string[] },
  { label: 'Orders Placed', types: ['ORDER_PLACED'] },
  { label: 'Accepted / Processing', types: ['ORDER_ACCEPTED'] },
  { label: 'Packhouse', types: ['PACKING_COMPLETE'] },
  { label: 'Dispatches & Transit', types: ['SHIPMENT_DISPATCHED', 'VESSEL_DEPARTED', 'IN_TRANSIT'] },
  { label: 'Customs & ETA', types: ['CUSTOMS_CLEARED', 'EXPECTED_DELIVERY'] },
  { label: 'Delivered', types: ['ORDER_DELIVERED', 'DELIVERY_CONFIRMED'] },
  { label: 'Cancelled', types: ['ORDER_CANCELLED'] },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [selectedFilterIdx, setSelectedFilterIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar grid vs timeline toggle & month navigation
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const fetchEvents = useCallback(async (silent = false) => {
    try {
      const data = await adminApi.getCalendarEvents();
      setEvents(Array.isArray(data) ? data : []);
      setLastSynced(new Date());
    } catch (err) {
      if (!silent) console.error('Failed to load calendar events', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      void fetchEvents(false);
    }, 0);
    const timer = setInterval(() => {
      void fetchEvents(true);
    }, 4000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [fetchEvents]);

  const handleRefresh = () => {
    setIsLoading(true);
    setIsSyncing(true);
    void fetchEvents(false);
  };

  const toDayKey = (dateInput: string | Date) => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const activeFilterTypes = FILTER_OPTIONS[selectedFilterIdx]?.types || [];

  const filteredEvents = events.filter((e) => {
    const matchesFilter = activeFilterTypes.length === 0 || activeFilterTypes.includes(e.eventType);
    const matchesDay = !selectedDayKey || (e.date && toDayKey(e.date) === selectedDayKey);
    const matchesSearch =
      !searchQuery ||
      (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.orderNumber && e.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.buyerName && e.buyerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.details && e.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesDay && matchesSearch;
  });

  const getEventBadgeClass = (badgeColor?: string) => {
    switch (badgeColor) {
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cyan': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'rose': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatEventLabel = (eventType: string) => {
    return eventType.replace(/^STATUS_/, '').replace(/_/g, ' ');
  };

  // Group filtered events by readable date string
  const groupedEvents: { [dateStr: string]: CalendarEventDto[] } = {};
  filteredEvents.forEach((e) => {
    const dateKey = e.date
      ? new Date(e.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Unscheduled';
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(e);
  });

  // Index ALL type-filtered events (ignoring selectedDayKey so calendar cells always stay populated)
  const eventsByDayKey: Record<string, CalendarEventDto[]> = {};
  events
    .filter((e) => activeFilterTypes.length === 0 || activeFilterTypes.includes(e.eventType))
    .forEach((e) => {
      if (!e.date) return;
      const key = toDayKey(e.date);
      if (!eventsByDayKey[key]) eventsByDayKey[key] = [];
      eventsByDayKey[key].push(e);
    });

  // Build calendar month grid days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = toDayKey(new Date());

  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(new Date(year, month, d));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary">
              <CalendarIcon className="w-3.5 h-3.5 text-tertiary" />
              <span>Operational Calendar API</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Live Stream</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
            Operations & Milestones Calendar
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Live tracking of order placement dates, packhouse sorting, port dispatch, ocean transit ETA, and consignee delivery. (Synced {lastSynced.toLocaleTimeString()})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Month Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'timeline' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Timeline
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isSyncing} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${(isLoading || isSyncing) ? 'animate-spin' : ''}`} />
            Sync Now
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
            {events.filter((e) => e.eventType === 'ORDER_PLACED').length}
          </div>
        </Card>

        <Card className="border-border shadow-soft bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
            <span>Dispatched / Transit</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mt-2">
            {events.filter((e) => ['SHIPMENT_DISPATCHED', 'VESSEL_DEPARTED', 'IN_TRANSIT'].includes(e.eventType)).length}
          </div>
        </Card>

        <Card className="border-border shadow-soft bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
            <span>Customs & ETA</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mt-2">
            {events.filter((e) => ['CUSTOMS_CLEARED', 'EXPECTED_DELIVERY'].includes(e.eventType)).length}
          </div>
        </Card>

        <Card className="border-border shadow-soft bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
            <span>Delivered / Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-foreground mt-2">
            {events.filter((e) => ['ORDER_DELIVERED', 'DELIVERY_CONFIRMED'].includes(e.eventType)).length}
          </div>
        </Card>
      </div>

      {/* Interactive Month Grid Calendar */}
      {viewMode === 'calendar' && (
        <Card className="border-border shadow-soft bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-heading font-bold text-base text-foreground min-w-[160px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs ml-1"
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelectedDayKey(null);
                }}
              >
                Today
              </Button>
            </div>

            {selectedDayKey && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Filtering: {new Date(selectedDayKey + 'T00:00:00').toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" onClick={() => setSelectedDayKey(null)} className="h-7 text-xs">
                  Show All Dates
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
            {calendarCells.map((cellDate, idx) => {
              if (!cellDate) {
                return <div key={`empty-${idx}`} className="min-h-[92px] bg-muted/10" />;
              }
              const key = toDayKey(cellDate);
              const dayEvents = eventsByDayKey[key] || [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDayKey;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDayKey(isSelected ? null : key)}
                  className={`min-h-[92px] p-2 text-left align-top flex flex-col gap-1 transition-colors hover:bg-muted/30 ${
                    isSelected ? 'bg-primary/10 ring-2 ring-inset ring-primary' : isToday ? 'bg-accent/30' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {cellDate.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border ${getEventBadgeClass(evt.badgeColor)}`}
                      >
                        {evt.orderNumber || formatEventLabel(evt.eventType)}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] font-semibold text-primary pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

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
          {FILTER_OPTIONS.map((f, idx) => (
            <button
              key={f.label}
              onClick={() => setSelectedFilterIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilterIdx === idx
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
                {dateEvents.map((evt) => (
                  <Card key={evt.id} className="border-border shadow-soft bg-card hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getEventBadgeClass(evt.badgeColor)}`}>
                            {formatEventLabel(evt.eventType)}
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
