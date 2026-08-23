import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
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
import { processSpeech } from "@/lib/agenda/speech-processor.functions";
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
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const runProcessSpeech = useServerFn(processSpeech);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      try {
        const result = await runProcessSpeech({
          data: {
            text: transcript,
            contextDate: new Date().toISOString()
          }
        });
        
        setForm(prev => ({
          ...prev,
          title: result.title || prev.title,
          description: result.description || prev.description,
          scope: result.scope || prev.scope,
          category: result.category || prev.category,
          date: result.date || prev.date,
          startTime: result.startTime || prev.startTime,
          endTime: result.endTime || prev.endTime,
          location: result.location || prev.location,
          responsible: result.responsible || prev.responsible,
          priority: result.priority || prev.priority,
        }));
        
        toast.success("Comando processado com sucesso!");
      } catch (error) {
        console.error("Speech processing error:", error);
        toast.error("Não entendi bem o comando. Preenchendo a descrição...");
        setForm(prev => ({ 
          ...prev, 
          description: prev.description ? `${prev.description}\n${transcript}` : transcript 
        }));
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.start();
  };

  useEffect(() => {
    if (!state.open) return;
    if (state.event) {
      const e = state.event;
      setForm({
        title: e.title,
        description: e.description ?? "",
        scope: e.scope,
        category: e.category,
        date: format(new Date(e.start_at), "yyyy-MM-dd"),
        startTime: format(new Date(e.start_at), "HH:mm"),
        endTime: format(new Date(e.end_at), "HH:mm"),
        location: e.location ?? "",
        client_id: e.client_id ?? NONE,
        responsible: e.responsible ?? "",
        priority: e.priority,
        status: e.status,
        notes: e.notes ?? "",
        recurrence: e.recurrence,
        recurrence_interval: String(e.recurrence_interval ?? 1),
        recurrence_end: e.recurrence_end ?? "",
        reminder: e.reminder_minutes ? String(e.reminder_minutes) : NONE,
      });
    } else {
      const base = state.start ?? new Date();
      const f = emptyForm();
      f.date = format(base, "yyyy-MM-dd");
      f.startTime = format(base, "HH:mm");
      f.endTime = format(new Date(base.getTime() + 3600000), "HH:mm");
      f.scope = state.scope ?? "empresa";
      f.category = state.scope === "pessoal" ? "pessoal" : "empresa";
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
    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);
    if (end <= start) {
      toast.error("O horário final deve ser maior que o inicial");
      return;
    }
    await save.mutateAsync({
      ...(state.event ? { id: state.event.id } : {}),
      title: form.title.trim().slice(0, 140),
      description: form.description.trim().slice(0, 2000) || null,
      scope: form.scope,
      category: form.category,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      location: form.location.trim() || null,
      client_id: form.client_id === NONE ? null : form.client_id,
      responsible: form.responsible.trim() || null,
      priority: form.priority,
      status: form.status,
      notes: form.notes.trim() || null,
      recurrence: form.recurrence,
      recurrence_interval: Number(form.recurrence_interval) || 1,
      recurrence_end: form.recurrence === "nao" ? null : form.recurrence_end || null,
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
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="desc">Descrição</Label>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className={`h-8 gap-2 rounded-full px-3 ${isListening ? 'animate-pulse bg-red-50 text-red-600 hover:bg-red-100' : ''}`}
                onClick={startListening}
                disabled={isListening || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="size-4 animate-pulse text-blue-500" />
                    Processando...
                  </>
                ) : isListening ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Ouvindo...
                  </>
                ) : (
                  <>
                    <Mic className="size-4" />
                    Comando de Voz
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="desc"
              value={form.description}
              maxLength={2000}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Digite ou use o comando de voz para descrever o compromisso..."
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
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="st">Hora inicial</Label>
              <Input
                id="st"
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="et">Hora final</Label>
              <Input
                id="et"
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </div>
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
            <Label>Cliente / contato</Label>
            <Select value={form.client_id} onValueChange={(v) => set("client_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Nenhum</SelectItem>
                {(clients ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` — ${c.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
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

          <div>
            <Label>Prioridade</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_STATUS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Recorrência</Label>
            <Select value={form.recurrence} onValueChange={(v) => set("recurrence", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.recurrence !== "nao" && (
            <>
              {form.recurrence === "personalizado" && (
                <div>
                  <Label htmlFor="int">Repetir a cada (dias)</Label>
                  <Input
                    id="int"
                    type="number"
                    min={1}
                    value={form.recurrence_interval}
                    onChange={(e) => set("recurrence_interval", e.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="rend">Repetir até</Label>
                <Input
                  id="rend"
                  type="date"
                  value={form.recurrence_end}
                  onChange={(e) => set("recurrence_end", e.target.value)}
                />
              </div>
            </>
          )}

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

          <div className="sm:col-span-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={form.notes}
              maxLength={2000}
              onChange={(e) => set("notes", e.target.value)}
            />
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
