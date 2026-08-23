import { createFileRoute } from "@tanstack/react-router";
import { useProfile, useUpdateProfile } from "@/lib/agenda/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { User, Shield, Bell, Palette, Globe, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  
  const [form, setForm] = useState({
    full_name: "",
    company: "",
    work_start: "09:00",
    work_end: "18:00",
    theme: "light",
    notify_in_app: true,
    login_user: "agendapro",
    login_pass: "73829155640",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        company: profile.company || "",
        work_start: profile.work_start || "09:00",
        work_end: profile.work_end || "18:00",
        theme: profile.theme || "light",
        notify_in_app: profile.notify_in_app ?? true,
      });
    }
  }, [profile]);

  const handleSave = () => {
    update.mutate(form);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Personalize sua experiência na Agenda Pro.</p>
      </div>

      <div className="grid gap-6">
        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Suas informações básicas de identificação.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input 
                id="name" 
                value={form.full_name} 
                onChange={(e) => setForm({...form, full_name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Empresa (opcional)</Label>
              <Input 
                id="company" 
                value={form.company} 
                onChange={(e) => setForm({...form, company: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Palette className="size-5" />
            </div>
            <div>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Como você prefere visualizar a aplicação.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-xs text-muted-foreground">Alterne entre modo claro e escuro.</p>
              </div>
              <Select value={form.theme} onValueChange={(v) => setForm({...form, theme: v})}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Globe className="size-5" />
            </div>
            <div>
              <CardTitle>Agenda</CardTitle>
              <CardDescription>Configurações de horário e exibição.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ws">Início do expediente</Label>
                <Input 
                  id="ws" 
                  type="time" 
                  value={form.work_start}
                  onChange={(e) => setForm({...form, work_start: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="we">Fim do expediente</Label>
                <Input 
                  id="we" 
                  type="time" 
                  value={form.work_end}
                  onChange={(e) => setForm({...form, work_end: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bell className="size-5" />
            </div>
            <div>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Escolha como deseja ser lembrado.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes no app</Label>
                <p className="text-xs text-muted-foreground">Exibir notificações dentro do sistema.</p>
              </div>
              <Switch 
                checked={form.notify_in_app} 
                onCheckedChange={(v) => setForm({...form, notify_in_app: v})} 
              />
            </div>
          </CardContent>
        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Lock className="size-5" />
            </div>
            <div>
              <CardTitle>Acesso</CardTitle>
              <CardDescription>Gerencie suas credenciais de login.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="login_user">Usuário</Label>
              <Input 
                id="login_user" 
                value={form.login_user} 
                onChange={(e) => setForm({...form, login_user: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login_pass">Senha</Label>
              <Input 
                id="login_pass" 
                type="password"
                value={form.login_pass} 
                onChange={(e) => setForm({...form, login_pass: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>


        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="rounded-xl w-full sm:w-auto" disabled={update.isPending}>
            <Save className="mr-2 size-4" /> Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
