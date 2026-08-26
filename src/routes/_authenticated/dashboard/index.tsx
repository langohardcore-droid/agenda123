import { createFileRoute } from "@tanstack/react-router";
import { cn, safeFormatDate } from "@/lib/utils";
import { useEvents, useProfile, useDeleteEvent, useSaveEvent } from "@/lib/agenda/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, CheckCircle, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { EventDialog, type EventDialogState } from "@/components/app/EventDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLongPress } from "@/hooks/use-long-press";
import { AgendaEvent } from "@/lib/agenda/types";


interface EventItemProps {
  event: AgendaEvent;
  onSelect: (event: AgendaEvent) => void;
  onLongPress: (event: AgendaEvent) => void;
}

function groupByDay(events: AgendaEvent[]) {
  const groups = new Map<string, { label: string; items: AgendaEvent[] }>();
  for (const event of events) {
    const key = (event.start_at || "").split("T")[0] || "sem-data";
    const label =
      key === "sem-data"
        ? "Sem data"
        : safeFormatDate(event.start_at, "EEEE 'dia' dd/MM");
    const group = groups.get(key) ?? { label, items: [] };
    group.items.push(event);
    groups.set(key, group);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, ...value }));
}

function EventItem({ event, onSelect, onLongPress }: EventItemProps) {
  const longPressProps = useLongPress(() => onLongPress(event));
  const formattedDate = safeFormatDate(event.start_at, "HH:mm");

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 cursor-pointer select-none transition-colors hover:bg-muted/50",
        event.status === "concluido" && "opacity-60 bg-muted/30"
      )}
      {...longPressProps}
      onClick={() => onSelect(event)}
    >
      <div
        className={cn(
          "size-2 rounded-full",
          event.status === "concluido" ? "bg-muted-foreground" : "bg-primary"
        )}
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", event.status === "concluido" && "line-through")}>
          {event.title}
        </p>
        {formattedDate && (
          <p className="text-xs text-muted-foreground">
            {formattedDate}
          </p>
        )}
      </div>
      <div className="md:hidden text-muted-foreground opacity-50">
        <MoreVertical className="size-4" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: events = [] } = useEvents();
  const deleteEvent = useDeleteEvent();
  const saveEvent = useSaveEvent();
  const { data: profile } = useProfile();
  const [eventDialog, setEventDialog] = useState<EventDialogState>({ open: false });
  const [menuEvent, setMenuEvent] = useState<AgendaEvent | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLongPress = (event: AgendaEvent) => {
    setMenuEvent(event);
    setMenuOpen(true);
  };

  const handleComplete = async (event: AgendaEvent) => {
    await saveEvent.mutateAsync({
      id: event.id,
      status: "concluido",
    });
    setMenuOpen(false);
  };

  const handleDelete = async (event: AgendaEvent) => {
    await deleteEvent.mutateAsync(event.id);
    setMenuOpen(false);
  };

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, ...
  const diffToMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekEvents = (events || []).filter((e) => {
    if (!e.start_at) return false;
    const d = new Date(e.start_at);
    return d >= weekStart && d <= weekEnd;
  });

  const todayStr = today.toISOString().split("T")[0] || "";
  const todayEvents = (events || []).filter((e) => e.start_at?.startsWith(todayStr));
  const sorted = [...weekEvents].sort((a, b) => (a.start_at || "").localeCompare(b.start_at || ""));
  const jessicaDays = groupByDay(sorted.filter((e) => e.responsible === "Jessica"));
  const andersonDays = groupByDay(sorted.filter((e) => e.responsible === "Anderson"));

  const renderDays = (
    days: ReturnType<typeof groupByDay>,
    nome: string,
    color: "jessica" | "anderson",
  ) =>
    days.length > 0 ? (
      days.map((day) => (
        <div key={day.key} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold",
                color === "jessica"
                  ? "bg-jessica-soft text-jessica"
                  : "bg-anderson-soft text-anderson",
              )}
            >
              {day.label}
            </span>
          </div>
          <div className="space-y-2">
            {day.items.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                onSelect={(e) => setEventDialog({ open: true, event: e })}
                onLongPress={handleLongPress}
              />
            ))}
          </div>
        </div>
      ))
    ) : (
      <p className="text-sm text-muted-foreground">Nenhum compromisso próximo para {nome}.</p>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {profile?.full_name?.split(" ")[0] || "usuário"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEventDialog({ open: true })} className="rounded-xl">
            <Plus className="mr-2 size-4" /> Novo compromisso
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground">compromissos marcados</p>
          </CardContent>
        </Card>
        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Semana</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">total de compromissos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface border-none">
          <CardHeader>
            <CardTitle>Agenda da Jessica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {renderDays(jessicaDays, "Jessica", "jessica")}
          </CardContent>
        </Card>

        <Card className="surface border-none">
          <CardHeader>
            <CardTitle>Agenda do Anderson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {renderDays(andersonDays, "Anderson", "anderson")}
          </CardContent>
        </Card>
      </div>

      <EventDialog
        state={eventDialog}
        onOpenChange={(open) => setEventDialog((s) => ({ ...s, open }))}
      />

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem
            onClick={() => menuEvent && handleComplete(menuEvent)}
            className="text-green-600 focus:text-green-600 focus:bg-green-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Concluído
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => menuEvent && handleDelete(menuEvent)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}