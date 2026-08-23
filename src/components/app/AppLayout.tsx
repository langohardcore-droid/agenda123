import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProfile, useRoles } from "@/lib/agenda/hooks";
import { GlobalSearch } from "./GlobalSearch";

const NAV = [
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/configuracoes/usuarios", label: "Gestão de Usuários", icon: Users, adminOnly: true },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: roles } = useRoles();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const theme = profile?.theme;
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [profile?.theme]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-1 bg-sidebar p-4">
      <div className="mb-4 flex items-center justify-between px-2">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <CalendarDays className="size-5" />
          </span>
          <span className="text-base font-extrabold tracking-tight">Agenda Pro</span>
        </Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          if ("adminOnly" in item && item.adminOnly && !roles?.includes("admin")) return null;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 rounded-xl border border-sidebar-border p-3">
        <p className="truncate text-sm font-semibold">{profile?.full_name || "Usuário"}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {roles?.[0] === "admin"
            ? "Administrador"
            : roles?.[0] === "pessoal"
              ? "Usuário pessoal"
              : "Funcionário"}
        </p>
        <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 size-4" /> Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-float">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-6" />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Search className="size-4" />
            <span>Pesquisar compromissos…</span>
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
