import { createApiClient } from "@repo/api-client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const api = createApiClient("localhost:3000");

const healthQuery = queryOptions({
  queryKey: ["health"],
  queryFn: () => api.health(),
});

export const Route = createFileRoute("/(authenticated)/new/")({
  component: Page,
});

function Page() {
  const health = useQuery(healthQuery);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "red",
      }}
    >
      {health.isPending && <p>Checking backend…</p>}
      {health.isError && <p>Backend unreachable: {health.error.message}</p>}
      {health.data && <p>Backend status: {health.data.status}</p>}
    </div>
  );
}
