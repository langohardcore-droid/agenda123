import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Lock, User } from "lucide-react";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: AuthPage,
});

function AuthPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const search = Route.useSearch();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock/Simple implementation based on user request
    // In a real app, this should be a server-side check. 
    // Since we're in a "simple shared login" mode as requested:
    if (login === "agendapro" && password === "73829155640") {
      localStorage.setItem("agenda_pro_auth", "true");
      toast.success("Login realizado com sucesso!");
      const target =
        search.redirect && search.redirect.startsWith("/") && !search.redirect.startsWith("//")
          ? search.redirect
          : "/dashboard";
      navigate({ to: target as "/dashboard", replace: true });
    } else {
      toast.error("Usuário ou senha incorretos");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <CalendarDays className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">Agenda Pro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A agenda de Jessica & Anderson.
          </p>
        </div>

        <Card className="border-none shadow-float overflow-hidden">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
            <CardDescription>
              Informe suas credenciais para acessar a agenda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pb-8 px-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input 
                    id="login" 
                    placeholder="Seu usuário" 
                    className="pl-10"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Sua senha" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
