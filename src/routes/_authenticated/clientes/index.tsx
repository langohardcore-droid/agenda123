import { createFileRoute } from "@tanstack/react-router";
import { useClients } from "@/lib/agenda/hooks";
import { useState } from "react";
import { ClientDialog, type ClientDialogState } from "@/components/app/ClientDialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, Building2, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/clientes/")({
  component: ClientsPage,
});

function ClientsPage() {
  const { data: clients = [] } = useClients();
  const [dialog, setDialog] = useState<ClientDialogState>({ open: false, kind: "cliente" });
  const [search, setSearch] = useState("");

  const filteredClients = (clients || []).filter(c => 
    c.kind === "cliente" && (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes empresariais.</p>
        </div>
        <Button onClick={() => setDialog({ open: true, kind: "cliente" })} className="rounded-xl">
          <Plus className="mr-2 size-4" /> Novo cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar clientes..." 
          className="pl-9 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card 
            key={client.id} 
            className="surface group border-none cursor-pointer transition-all hover:shadow-float"
            onClick={() => setDialog({ open: true, client })}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="size-12 rounded-xl">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                    {client.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                    {client.name}
                  </h3>
                  {client.company && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Building2 className="size-3" />
                      <span className="truncate">{client.company}</span>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    {client.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="size-3.5" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="size-3.5" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>

      <ClientDialog state={dialog} onOpenChange={(open) => setDialog(s => ({ ...s, open }))} />
    </div>
  );
}
