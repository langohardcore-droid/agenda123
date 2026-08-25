import { createFileRoute } from "@tanstack/react-router";
import { useTasks } from "@/lib/agenda/hooks";
import { useState } from "react";
import { TaskDialog, type TaskDialogState } from "@/components/app/TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, safeFormatDate } from "@/lib/utils";
import { type Task } from "@/lib/agenda/types";

export const Route = createFileRoute("/_authenticated/tarefas/")({
  component: TasksPage,
});

function TasksPage() {
  const { data: tasks = [] } = useTasks();
  const [dialog, setDialog] = useState<TaskDialogState>({ open: false });
  const [search, setSearch] = useState("");

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "concluida": return <CheckCircle2 className="size-5 text-pessoal" />;
      case "atrasada": return <AlertTriangle className="size-5 text-destructive" />;
      case "em_andamento": return <Clock className="size-5 text-primary" />;
      default: return <Circle className="size-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e prazos.</p>
        </div>
        <Button onClick={() => setDialog({ open: true })} className="rounded-xl">
          <Plus className="mr-2 size-4" /> Nova tarefa
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar tarefas..." 
            className="pl-9 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-xl">
          <Filter className="mr-2 size-4" /> Filtros
        </Button>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className="surface group border-none cursor-pointer transition-all hover:translate-x-1"
            onClick={() => setDialog({ open: true, task })}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="shrink-0">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-medium truncate",
                    task.status === "concluida" && "text-muted-foreground line-through"
                  )}>
                    {task.title}
                  </h3>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                    {task.scope}
                  </Badge>
                </div>
                {task.due_at && safeFormatDate(task.due_at, "dd/MM/yyyy") && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prazo: {safeFormatDate(task.due_at, "dd/MM/yyyy")}
                  </p>
                )}
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "hidden sm:inline-flex capitalize",
                  task.priority === "urgente" && "bg-destructive/10 text-destructive border-destructive/20"
                )}
              >
                {task.priority}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma tarefa encontrada.</p>
          </div>
        )}
      </div>

      <TaskDialog state={dialog} onOpenChange={(open) => setDialog(s => ({ ...s, open }))} />
    </div>
  );
}
