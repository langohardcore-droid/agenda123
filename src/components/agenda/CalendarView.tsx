import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type AgendaEvent } from "@/lib/agenda/types";
import { palette } from "@/lib/agenda/colors";

interface CalendarProps {
  events: AgendaEvent[];
  onSelectEvent: (event: AgendaEvent) => void;
  onSelectSlot: (date: Date) => void;
}

export function CalendarView({ events, onSelectEvent, onSelectSlot }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="surface flex flex-col overflow-hidden border-none shadow-float">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="rounded-lg">
            Hoje
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-lg">
              <ChevronLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-lg">
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-7 bg-muted/30">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 border-l border-t">
        {calendarDays.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.start_at), day));
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={day.toString()}
              onClick={() => onSelectSlot(day)}
              className={cn(
                "group relative min-h-[120px] border-b border-r p-2 transition-colors hover:bg-muted/30 cursor-pointer",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground/50",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>

              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const p = palette(event.category);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={cn(
                        "truncate rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-80",
                        p.chip,
                      )}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="px-1 text-[10px] font-semibold text-muted-foreground">
                    + {dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
