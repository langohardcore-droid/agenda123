import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarDays, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [loading, setLoading] = useState(false);
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar com Google");
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
              Utilize sua conta Google para entrar no Agenda Pro de forma rápida e segura.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pb-8 px-8">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium border-2 hover:bg-secondary/50 transition-all rounded-xl gap-3"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Simplificamos para você</span>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground leading-relaxed">
              Não é necessário confirmar e-mail ou criar senhas complexas. 
              Um único clique e você está dentro!
            </p>
          </CardContent>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <Link to="/" className="underline underline-offset-4 hover:text-primary">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link to="/" className="underline underline-offset-4 hover:text-primary">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
