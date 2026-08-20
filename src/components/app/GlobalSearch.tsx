import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useClients, useEvents, useTasks } from "@/lib/agenda/hooks";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { data: events } = useEvents();
  const { data: tasks } = useTasks();
  const { data: clients } = useClients();

  function go(to: string) {
    onOpenChange(false);
    navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar em toda a agenda…" />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Compromissos">
          {(events ?? []).slice(0, 30).map((e) => (
            <CommandItem key={e.id} value={`${e.title} ${e.location ?? ""}`} onSelect={() => go("/compromissos")}>
              <span className="truncate">{e.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {format(new Date(e.start_at), "dd/MM HH:mm")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tarefas">
          {(tasks ?? []).slice(0, 30).map((t) => (
            <CommandItem key={t.id} value={t.title} onSelect={() => go("/tarefas")}>
              {t.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Clientes e contatos">
          {(clients ?? []).slice(0, 30).map((c) => (
            <CommandItem
              key={c.id}
              value={`${c.name} ${c.company ?? ""} ${c.email ?? ""}`}
              onSelect={() => go(c.kind === "contato" ? "/contatos" : "/clientes")}
            >
              <span>{c.name}</span>
              {c.company && <span className="ml-auto text-xs text-muted-foreground">{c.company}</span>}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
