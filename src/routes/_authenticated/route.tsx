import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/app/AppLayout";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});
