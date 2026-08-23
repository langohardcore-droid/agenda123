import { createFileRoute } from "@tanstack/react-router";
import { useEvents } from "@/lib/agenda/hooks";
import { useState } from "react";
import { CalendarView } from "@/components/agenda/CalendarView";
import { EventDialog, type EventDialogState } from "@/components/app/EventDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type AgendaEvent } from "@/lib/agenda/types";

export const Route = createFileRoute("/_authenticated/agenda/")({
  component: AgendaPage,
});

function AgendaPage() {
  const { data: events = [] } = useEvents();
  const [dialog, setDialog] = useState<EventDialogState>({ open: false });
  const [view, setView] = useState("mes");

  const onSelectEvent = (event: AgendaEvent) => {
    setDialog({ open: true, event });
  };

  const onSelectSlot = (date: Date) => {
    setDialog({ open: true, start: date });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus compromissos e reuniões.</p>
        </div>
        <Tabs value={view} onValueChange={setView} className="w-auto">
          <TabsList className="rounded-xl">
            <TabsTrigger value="dia" className="rounded-lg">Dia</TabsTrigger>
            <TabsTrigger value="semana" className="rounded-lg">Semana</TabsTrigger>
            <TabsTrigger value="mes" className="rounded-lg">Mês</TabsTrigger>
            <TabsTrigger value="lista" className="rounded-lg">Lista</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CalendarView 
        events={events} 
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
      />

      <EventDialog state={dialog} onOpenChange={(open) => setDialog(s => ({ ...s, open }))} />
    </div>
  );
}
