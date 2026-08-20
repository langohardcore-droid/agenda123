import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AgendaEvent, AppRole, Client, Notification, Profile, Task } from "./types";

export function useSession() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUserId(data.session?.user.id ?? null);
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, email, ready };
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async (): Promise<AppRole[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.user.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sem sessão");
      const { error } = await supabase.from("profiles").update(values).eq("user_id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Configurações salvas");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<AgendaEvent[]> => {
      const { data, error } = await supabase.from("events").select("*").order("start_at");
      if (error) throw error;
      return (data ?? []) as AgendaEvent[];
    },
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("due_at", { nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase.from("clients").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("scheduled_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export function useSaveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<AgendaEvent> & { id?: string }) => {
      const uid = await currentUserId();
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from("events").update(rest).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("events")
        .insert({ ...rest, user_id: uid } as never)
        .select("id, title, start_at, reminder_minutes")
        .single();
      if (error) throw error;
      if (values.reminder_minutes) {
        const when = new Date(
          new Date(values.start_at as string).getTime() - values.reminder_minutes * 60000,
        );
        await supabase.from("notifications").insert({
          user_id: uid,
          title: `Lembrete: ${values.title}`,
          body: `Compromisso em ${new Date(values.start_at as string).toLocaleString("pt-BR")}`,
          event_id: data.id,
          scheduled_at: when.toISOString(),
        } as never);
      }
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Compromisso salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Compromisso excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSaveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Task> & { id?: string }) => {
      const uid = await currentUserId();
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from("tasks").update(rest).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("tasks").insert({ ...rest, user_id: uid } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa salva");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa excluída");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSaveClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<Client> & { id?: string }) => {
      const uid = await currentUserId();
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from("clients").update(rest).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("clients").insert({ ...rest, user_id: uid } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cadastro salvo");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cadastro excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarkNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from("notifications").update({ read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
