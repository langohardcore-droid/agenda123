import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { UserPlus, Shield, User, Loader2, Trash2 } from "lucide-react";
import { useRoles } from "@/lib/agenda/hooks";

export const Route = createFileRoute("/_authenticated/configuracoes/usuarios")({
  component: UserManagementPage,
});

function UserManagementPage() {
  const { data: roles } = useRoles();
  const isAdmin = roles?.includes("admin");
  const qc = useQueryClient();
  
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "moderator" | "user">("user");
  const [isCreating, setIsCreating] = useState(false);

  // Busca todos os perfis e seus papéis
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          user_id,
          full_name,
          user_roles (
            role
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  const createUser = useMutation({
    mutationFn: async () => {
      // Nota: No Supabase padrão, criar um usuário via cliente não é possível sem a Service Role Key
      // ou se o Admin Auth for configurado. Em Lovable Cloud, usaremos o fluxo de convite
      // ou simulação via banco se o usuário tiver permissão.
      // Para manter "Simples" como pedido, vamos orientar que novos usuários entram via Google 
      // e o ADM apenas gerencia os papéis aqui.
      
      toast.info("Para manter a segurança, novos usuários devem entrar via Google. Use esta tela para ajustar permissões de quem já entrou.");
    }
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      // Primeiro remove papéis antigos
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Adiciona o novo papel
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: newRole as any
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
                          defaultValue={u.user_roles?.[0]?.role || "user"} 
                          onValueChange={(val) => updateRole.mutate({ userId: u.user_id, newRole: val })}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="moderator">Funcionário</SelectItem>
                            <SelectItem value="user">Pessoal</SelectItem>
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
              Como o sistema utiliza o Login do Google para maior simplicidade e segurança, 
              basta pedir para o novo usuário entrar uma vez no sistema. 
              Ele aparecerá automaticamente nesta lista, onde você poderá elevá-lo a <strong>Administrador</strong> ou <strong>Funcionário</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
