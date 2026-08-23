import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients, useDeleteEvent, useSaveEvent } from "@/lib/agenda/hooks";

import { useServerFn } from "@tanstack/react-start";
import {
  CATEGORIES,
  EVENT_STATUS,
  PRIORITIES,
  RECURRENCES,
  REMINDERS,
  type AgendaEvent,
  type Scope,
} from "@/lib/agenda/types";
import { toast } from "sonner";

export interface EventDialogState {
  open: boolean;
  event?: AgendaEvent | null;
  start?: Date;
  scope?: Scope;
  initialDescription?: string;
}

const NONE = "__none__";

export function EventDialog({
  state,
  onOpenChange,
}: {
  state: EventDialogState;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useSaveEvent();
  const remove = useDeleteEvent();
  const { data: clients } = useClients();

  const [form, setForm] = useState(() => emptyForm());


  useEffect(() => {
    if (!state.open) return;
    if (state.event) {
      const e = state.event;
      setForm({
        title: e.title,
        description: e.description ?? "",
        scope: e.scope,
        category: "empresa",
        date: format(new Date(e.start_at), "yyyy-MM-dd"),
        location: e.location ?? "",
        responsible: e.responsible ?? "",
        reminder: e.reminder_minutes ? String(e.reminder_minutes) : NONE,
      });
    } else {
      const base = state.start ?? new Date();
      const f = emptyForm();
      f.date = format(base, "yyyy-MM-dd");
      f.scope = state.scope ?? "empresa";
      if (state.initialDescription) {
        f.description = state.initialDescription;
      }
      setForm(f);
    }
  }, [state.open, state.event, state.start, state.scope]);

  function set<K extends keyof ReturnType<typeof emptyForm>>(
    key: K,
    value: ReturnType<typeof emptyForm>[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    if (!form.title.trim()) {
      toast.error("Informe o título do compromisso");
      return;
    }
    const start = new Date(`${form.date}T09:00:00`);
    const end = new Date(`${form.date}T10:00:00`);
    await save.mutateAsync({
      ...(state.event ? { id: state.event.id } : {}),
      title: form.title.trim().slice(0, 140),
      description: form.description.trim().slice(0, 2000) || null,
      scope: form.scope,
      category: "empresa",
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      location: form.location.trim() || null,
      responsible: form.responsible.trim() || null,
      priority: "media",
      status: "agendado",
      notes: null,
      recurrence: "nao",
      recurrence_interval: 1,
      recurrence_end: null,
      reminder_minutes: form.reminder === NONE ? null : Number(form.reminder),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{state.event ? "Editar compromisso" : "Novo compromisso"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do compromisso empresarial ou pessoal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Responsável</Label>
            <Select value={form.responsible} onValueChange={(v) => set("responsible", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jessica">Jessica</SelectItem>
                <SelectItem value="Anderson">Anderson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={form.title}
              maxLength={140}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex.: Reunião de alinhamento"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="mb-2">
              <Label htmlFor="desc">Descrição</Label>
            </div>

            <Textarea
              id="desc"
              value={form.description}
              maxLength={2000}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descreva o compromisso..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label>Tipo</Label>
            <Select value={form.scope} onValueChange={(v) => set("scope", v as Scope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empresa">Empresa</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>


          <div>
            <Label htmlFor="loc">Local</Label>
            <Input
              id="loc"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>





          <div>
            <Label>Lembrete</Label>
            <Select value={form.reminder} onValueChange={(v) => set("reminder", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sem lembrete" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem lembrete</SelectItem>
                {REMINDERS.map((r) => (
                  <SelectItem key={r.value} value={String(r.value)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {state.event ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="mr-2 size-4" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir compromisso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await remove.mutateAsync(state.event!.id);
                      onOpenChange(false);
                    }}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={save.isPending}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function emptyForm() {
  return {
    title: "",
    description: "",
    scope: "empresa" as Scope,
    category: "empresa",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    client_id: NONE,
    responsible: "Jessica",
    priority: "media" as AgendaEvent["priority"],
    status: "agendado" as AgendaEvent["status"],
    notes: "",
    recurrence: "nao" as AgendaEvent["recurrence"],
    recurrence_interval: "1",
    recurrence_end: "",
    reminder: NONE,
  };
}
