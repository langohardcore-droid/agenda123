import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, User, Loader2, Trash2 } from "lucide-react";
import { useRoles } from "@/lib/agenda/hooks";
import { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/configuracoes/usuarios")({
  component: UserManagementPage,
});

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  full_name: string;
  role: AppRole;
}

function UserManagementPage() {
  const { data: roles } = useRoles();
  const isAdmin = roles?.includes("admin");
  const qc = useQueryClient();
  
  const { data: users, isLoading } = useQuery<UserWithRole[]>({
    queryKey: ["admin-users"],
    enabled: !!isAdmin,
    queryFn: async () => {
      // Busca perfis
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("user_id, full_name");
      
      if (pError) throw pError;

      // Busca papéis
      const { data: userRoles, error: rError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rError) throw rError;

      // Mapeia os dados
      return profiles.map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        role: userRoles.find(r => r.user_id === p.user_id)?.role || "pessoal"
      }));
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: AppRole }) => {
      // Primeiro remove papéis antigos para este usuário
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Adiciona o novo papel
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: newRole
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Papel do usuário atualizado");
    },
    onError: (e: any) => toast.error(e.message)
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="size-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie quem tem acesso ao sistema e seus níveis de permissão.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="surface border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="size-5" />
              Usuários Registrados
            </CardTitle>
            <CardDescription>Lista de usuários que já acessaram o sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Papel Atual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">{u.full_name || "Sem nome"}</TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={u.role} 
                          onValueChange={(val) => updateRole.mutate({ userId: u.user_id, newRole: val as AppRole })}
                        >
                          <SelectTrigger className="w-40 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="funcionario">Funcionário</SelectItem>
                            <SelectItem value="pessoal">Pessoal</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-dashed border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Dica do Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Como o sistema utiliza o Login do Google, basta pedir para o novo usuário entrar uma vez no sistema. 
              Ele aparecerá automaticamente nesta lista, onde você poderá elevá-lo a <strong>Administrador</strong> ou <strong>Funcionário</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
