export type Scope = "empresa" | "pessoal";
export type Priority = "baixa" | "media" | "alta" | "urgente";
export type EventStatus = "agendado" | "confirmado" | "concluido" | "cancelado";
export type TaskStatus = "a_fazer" | "em_andamento" | "concluida" | "atrasada";
export type Recurrence = "nao" | "diario" | "semanal" | "mensal" | "anual" | "personalizado";
export type AppRole = "admin" | "funcionario" | "pessoal";

export interface Client {
  id: string;
  user_id: string;
  kind: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface AgendaEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scope: Scope;
  category: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  location: string | null;
  client_id: string | null;
  responsible: string | null;
  priority: Priority;
  status: EventStatus;
  notes: string | null;
  recurrence: Recurrence;
  recurrence_interval: number;
  recurrence_end: string | null;
  reminder_minutes: number | null;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scope: Scope;
  category: string;
  due_at: string | null;
  priority: Priority;
  responsible: string | null;
  status: TaskStatus;
  client_id: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  event_id: string | null;
  task_id: string | null;
  scheduled_at: string;
  read: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  company: string | null;
  work_start: string;
  work_end: string;
  timezone: string;
  week_start: number;
  theme: string;
  notify_in_app: boolean;
  default_reminder: number;
  color_empresa: string;
  color_pessoal: string;
}

export const CATEGORIES = [
  { value: "empresa", label: "Empresa", token: "empresa" },
  { value: "pessoal", label: "Pessoal", token: "pessoal" },
  { value: "reuniao", label: "Reunião", token: "reuniao" },
  { value: "urgente", label: "Urgente", token: "urgente" },
  { value: "tarefa", label: "Tarefa", token: "tarefa" },
  { value: "cliente", label: "Cliente", token: "empresa" },
  { value: "visita", label: "Visita", token: "empresa" },
  { value: "evento", label: "Evento", token: "reuniao" },
  { value: "ligacao", label: "Ligação", token: "empresa" },
  { value: "prazo", label: "Prazo", token: "urgente" },
  { value: "consulta", label: "Consulta", token: "pessoal" },
  { value: "aniversario", label: "Aniversário", token: "pessoal" },
  { value: "viagem", label: "Viagem", token: "pessoal" },
  { value: "lembrete", label: "Lembrete", token: "tarefa" },
] as const;

export function categoryToken(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.token ?? "empresa";
}

export function categoryLabel(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export const EVENT_STATUS: { value: EventStatus; label: string }[] = [
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

export const TASK_STATUS: { value: TaskStatus; label: string }[] = [
  { value: "a_fazer", label: "A fazer" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "atrasada", label: "Atrasada" },
];

export const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: "nao", label: "Não repetir" },
  { value: "diario", label: "Todos os dias" },
  { value: "semanal", label: "Toda semana" },
  { value: "mensal", label: "Todo mês" },
  { value: "anual", label: "Todo ano" },
  { value: "personalizado", label: "Personalizado" },
];

export const REMINDERS: { value: number; label: string }[] = [
  { value: 5, label: "5 minutos antes" },
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 1440, label: "1 dia antes" },
];
