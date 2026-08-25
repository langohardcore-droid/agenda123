import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("agenda_pro_auth") === "true";
      if (!isAuth) {
        throw redirect({ to: "/auth" });
      }
    }
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
