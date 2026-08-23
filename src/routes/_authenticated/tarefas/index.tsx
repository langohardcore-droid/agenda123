import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/tarefas/")({ component: () => <div className="p-4">Tarefas em construção...</div> });
