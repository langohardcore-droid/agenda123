import { createFileRoute } from "@tanstack/react-router";
import { useNotifications, useMarkNotification } from "@/lib/agenda/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Check, Trash2 } from "lucide-react";
import { cn, safeFormatDate } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notificacoes/")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: notifications = [] } = useNotifications();
  const mark = useMarkNotification();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">Fique por dentro dos seus próximos compromissos.</p>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <Card 
              key={n.id} 
              className={cn(
                "surface border-none transition-all",
                !n.read && "bg-primary/5 border-l-4 border-l-primary"
              )}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  n.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                )}>
                  <Bell className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={cn("font-bold truncate", n.read && "font-medium text-muted-foreground")}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap uppercase">
                      {safeFormatDate(n.scheduled_at, "d 'de' MMMM, HH:mm")}
                    </span>
                  </div>
                  <p className={cn("text-sm mt-1", n.read ? "text-muted-foreground" : "text-foreground")}>
                    {n.body}
                  </p>
                  {!n.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => mark.mutate({ id: n.id, read: true })}
                    >
                      <Check className="mr-1 size-3.5" /> Marcar como lida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-muted mb-4">
              <BellOff className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Tudo limpo por aqui!</h3>
            <p className="text-muted-foreground">Você não tem notificações no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
