import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("agenda_pro_auth") === "true";
      if (!isAuth) {
        throw redirect({
          to: "/auth",
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});
