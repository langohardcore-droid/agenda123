import { createFileRoute } from "@tanstack/react-router";
import { useEvents, useProfile } from "@/lib/agenda/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Mic, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { EventDialog, type EventDialogState } from "@/components/app/EventDialog";
import { processSpeech } from "@/lib/agenda/speech-processor.functions";
import { useServerFn } from "@tanstack/react-start";


export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: events = [] } = useEvents();
  
  const { data: profile } = useProfile();
  
  const [eventDialog, setEventDialog] = useState<EventDialogState>({ open: false });
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const runProcessSpeech = useServerFn(processSpeech);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      try {
        await runProcessSpeech({ 
          data: {
            text: transcript,
            contextDate: new Date().toISOString()
          }
        });
        
        setEventDialog({
          open: true,
          event: null,
          initialDescription: transcript
        } as any);
      } catch (error) {
        setEventDialog({
          open: true,
          event: null,
          initialDescription: transcript
        } as any);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.start();
  };
  

  const todayStr = new Date().toISOString().split("T")[0] || "";
  const todayEvents = (events || []).filter((e) => e.start_at?.startsWith(todayStr));
  const upcomingEvents = (events || []).filter((e) => (e.start_at || "") > todayStr);
  const jessicaEvents = upcomingEvents.filter(e => e.responsible === "Jessica").slice(0, 5);
  const andersonEvents = upcomingEvents.filter(e => e.responsible === "Anderson").slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {profile?.full_name?.split(" ")[0] || "usuário"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={startListening}
            className={`rounded-xl ${isListening ? 'animate-pulse border-red-200 bg-red-50 text-red-600' : ''} ${isProcessing ? 'animate-pulse border-blue-200 bg-blue-50 text-blue-600' : ''}`}
            disabled={isListening || isProcessing}
          >
            {isProcessing ? (
              <Sparkles className="mr-2 size-4 animate-pulse text-blue-500" />
            ) : isListening ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Mic className="mr-2 size-4" />
            )}
            {isProcessing ? "Processando..." : isListening ? "Ouvindo..." : "Voz"}
          </Button>
          <Button onClick={() => setEventDialog({ open: true })} className="rounded-xl">
            <Plus className="mr-2 size-4" /> Novo compromisso
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground">compromissos marcados</p>
          </CardContent>
        </Card>
        <Card className="surface border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Semana</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">total de compromissos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface border-none">
          <CardHeader>
            <CardTitle>Agenda da Jessica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jessicaEvents.length > 0 ? (
              jessicaEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: `var(--cat-${event.category})` }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum compromisso próximo para Jessica.</p>
            )}
          </CardContent>
        </Card>

        <Card className="surface border-none">
          <CardHeader>
            <CardTitle>Agenda do Anderson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {andersonEvents.length > 0 ? (
              andersonEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: `var(--cat-${event.category})` }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum compromisso próximo para Anderson.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <EventDialog state={eventDialog} onOpenChange={(open) => setEventDialog(s => ({ ...s, open }))} />
      
    </div>
  );
}