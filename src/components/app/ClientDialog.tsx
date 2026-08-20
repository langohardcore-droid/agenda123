import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveClient } from "@/lib/agenda/hooks";
import type { Client } from "@/lib/agenda/types";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  company: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.union([z.string().trim().email("E-mail inválido").max(255), z.literal("")]),
  notes: z.string().trim().max(1000).optional(),
});

export interface ClientDialogState {
  open: boolean;
  client?: Client | null;
  kind?: "cliente" | "contato";
}

export function ClientDialog({
  state,
  onOpenChange,
}: {
  state: ClientDialogState;
  onOpenChange: (v: boolean) => void;
}) {
  const save = useSaveClient();
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", notes: "" });

  useEffect(() => {
    if (!state.open) return;
    setForm({
      name: state.client?.name ?? "",
      company: state.client?.company ?? "",
      phone: state.client?.phone ?? "",
      email: state.client?.email ?? "",
      notes: state.client?.notes ?? "",
    });
  }, [state.open, state.client]);

  async function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    await save.mutateAsync({
      ...(state.client ? { id: state.client.id } : {}),
      kind: state.client?.kind ?? state.kind ?? "cliente",
      name: parsed.data.name,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    });
    onOpenChange(false);
  }

  const label = (state.client?.kind ?? state.kind ?? "cliente") === "contato" ? "contato" : "cliente";

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {state.client ? `Editar ${label}` : `Novo ${label}`}
          </DialogTitle>
          <DialogDescription>Dados de contato usados nos compromissos.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="c-name">Nome</Label>
            <Input
              id="c-name"
              value={form.name}
              maxLength={120}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="c-company">Empresa</Label>
            <Input
              id="c-company"
              value={form.company}
              maxLength={120}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-phone">Telefone</Label>
              <Input
                id="c-phone"
                value={form.phone}
                maxLength={30}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="c-email">E-mail</Label>
              <Input
                id="c-email"
                type="email"
                value={form.email}
                maxLength={255}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="c-notes">Observações</Label>
            <Textarea
              id="c-notes"
              value={form.notes}
              maxLength={1000}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={save.isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
