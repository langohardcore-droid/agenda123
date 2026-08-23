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
      </CommandList>
    </CommandDialog>
  );
}
