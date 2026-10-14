import { createApiClient, type HealthResponse } from "@repo/api-client";
import { useEffect, useState } from "react";

const api = createApiClient("http://localhost:3000");

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p>Backend unreachable: {error}</p>;
  if (!health) return <p>Checking backend…</p>;
  if (health.status === "error") return <p>Backend reports an error</p>;
  return <p>Backend OK at {health.timestamp}</p>;
}
