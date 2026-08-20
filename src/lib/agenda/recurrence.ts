import { addDays, addMonths, addWeeks, addYears, isAfter, isBefore, endOfDay } from "date-fns";
import type { AgendaEvent } from "./types";

export interface Occurrence extends AgendaEvent {
  occurrenceKey: string;
  start: Date;
  end: Date;
}

/** Expands recurring events into concrete occurrences within [from, to]. */
export function expandEvents(events: AgendaEvent[], from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = [];

  for (const ev of events) {
    const start = new Date(ev.start_at);
    const end = new Date(ev.end_at);
    const duration = Math.max(end.getTime() - start.getTime(), 0);
    const limit = ev.recurrence_end ? endOfDay(new Date(`${ev.recurrence_end}T00:00:00`)) : to;
    const hardStop = isBefore(limit, to) ? limit : to;

    if (ev.recurrence === "nao") {
      if (!isAfter(start, to) && !isBefore(end, from)) {
        out.push({ ...ev, occurrenceKey: ev.id, start, end: new Date(start.getTime() + duration) });
      }
      continue;
    }

    const step = Math.max(1, ev.recurrence_interval || 1);
    let cursor = new Date(start);
    let guard = 0;

    while (guard++ < 1000 && !isAfter(cursor, hardStop)) {
      if (!isBefore(cursor, from)) {
        out.push({
          ...ev,
          occurrenceKey: `${ev.id}:${cursor.toISOString()}`,
          start: new Date(cursor),
          end: new Date(cursor.getTime() + duration),
        });
      }
      switch (ev.recurrence) {
        case "diario":
          cursor = addDays(cursor, step);
          break;
        case "semanal":
          cursor = addWeeks(cursor, step);
          break;
        case "mensal":
          cursor = addMonths(cursor, step);
          break;
        case "anual":
          cursor = addYears(cursor, step);
          break;
        default:
          cursor = addDays(cursor, step);
          break;
      }
    }
  }

  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}
