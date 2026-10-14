import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/(home)/")({
  beforeLoad: () => {
    throw redirect({ to: "/new" });
  },
});
