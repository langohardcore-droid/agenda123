import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { useDeleteTask, useSaveTask } from "@/lib/agenda/hooks";
import { PRIORITIES, TASK_STATUS, type Scope, type Task } from "@/lib/agenda/types";

export interface TaskDialogState {
  open: boolean;
  task?: Task | null;
  scope?: Scope;
}

export function TaskDialog({
  state,
  onOpenChange,
}: {
  state: TaskDialogState;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useSaveTask();
  const remove = useDeleteTask();
  const [form, setForm] = useState(() => empty());

  useEffect(() => {
    if (!state.open) return;
    if (state.task) {
      const t = state.task;
      setForm({
        title: t.title,
        description: t.description ?? "",
        scope: t.scope,
        due: t.due_at ? format(new Date(t.due_at), "yyyy-MM-dd'T'HH:mm") : "",
        priority: t.priority,
        responsible: t.responsible ?? "",
        status: t.status,
      });
    } else {
      setForm({ ...empty(), scope: state.scope ?? "empresa" });
    }
  }, [state.open, state.task, state.scope]);

  async function submit() {
    if (!form.title.trim()) {
      toast.error("Informe o título da tarefa");
      return;
    }
    await save.mutateAsync({
      ...(state.task ? { id: state.task.id } : {}),
      title: form.title.trim().slice(0, 140),
      description: form.description.trim().slice(0, 2000) || null,
      scope: form.scope,
      due_at: form.due ? new Date(form.due).toISOString() : null,
      priority: form.priority,
      responsible: form.responsible.trim() || null,
      status: form.status,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{state.task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>Organize suas tarefas profissionais e pessoais.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="t-title">Título</Label>
            <Input
              id="t-title"
              value={form.title}
              maxLength={140}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="t-desc">Descrição</Label>
            <Textarea
              id="t-desc"
              value={form.description}
              maxLength={2000}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.scope}
                onValueChange={(v) => setForm({ ...form, scope: v as Scope })}
              >
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
              <Label htmlFor="t-due">Prazo</Label>
              <Input
                id="t-due"
                type="datetime-local"
                value={form.due}
                onChange={(e) => setForm({ ...form, due: e.target.value })}
              />
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as never })}
              >
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
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as never })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="t-resp">Responsável</Label>
              <Input
                id="t-resp"
                value={form.responsible}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {state.task ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="mr-2 size-4" /> Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await remove.mutateAsync(state.task!.id);
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

function empty() {
  return {
    title: "",
    description: "",
    scope: "empresa" as Scope,
    due: "",
    priority: "media" as Task["priority"],
    responsible: "",
    status: "a_fazer" as Task["status"],
  };
}
