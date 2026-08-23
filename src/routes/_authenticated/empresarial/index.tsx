import { createFileRoute } from "@tanstack/react-router";
import { useEvents } from "@/lib/agenda/hooks";
import { useState } from "react";
import { CalendarView } from "@/components/agenda/CalendarView";
import { EventDialog, type EventDialogState } from "@/components/app/EventDialog";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { type AgendaEvent } from "@/lib/agenda/types";

export const Route = createFileRoute("/_authenticated/empresarial/")({
  component: BusinessAgendaPage,
});

function BusinessAgendaPage() {
  const { data: events = [] } = useEvents();
  const [dialog, setDialog] = useState<EventDialogState>({ open: false, scope: "empresa" });

  const businessEvents = (events || []).filter(e => e.scope === "empresa");

  const onSelectEvent = (event: AgendaEvent) => {
    setDialog({ open: true, event, scope: "empresa" });
  };

  const onSelectSlot = (date: Date) => {
    setDialog({ open: true, start: date, scope: "empresa" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-empresa/10 text-empresa">
            <Briefcase className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda Empresarial</h1>
            <p className="text-muted-foreground">Compromissos e reuniões profissionais.</p>
          </div>
        </div>
        <Button onClick={() => setDialog({ open: true, scope: "empresa" })} className="rounded-xl bg-empresa hover:bg-empresa/90">
          <Plus className="mr-2 size-4" /> Novo compromisso
        </Button>
      </div>

      <CalendarView 
        events={businessEvents} 
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
      />

      <EventDialog state={dialog} onOpenChange={(open) => setDialog(s => ({ ...s, open }))} />
    </div>
  );
}
