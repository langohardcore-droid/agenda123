import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/agenda/")({
  component: () => <div className="p-4">Agenda em construção...</div>,
});
