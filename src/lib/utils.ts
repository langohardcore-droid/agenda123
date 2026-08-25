import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dateFnsFormat } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return isNaN(d.getTime()) ? null : d;
}

export function safeFormatDate(
  date: string | Date | null | undefined,
  formatStr: string = "dd/MM/yyyy HH:mm",
  options?: Parameters<typeof dateFnsFormat>[2]
): string {
  const d = safeDate(date);
  if (!d) return "";
  try {
    return dateFnsFormat(d, formatStr, { locale: ptBR, ...options });
  } catch {
    return "";
  }
}
