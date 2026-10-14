export type HealthResponse = {
  status: "ok" | "error";
  timestamp: string;
};

export function createApiClient(baseUrl: string) {
  return {
    async health(): Promise<HealthResponse> {
      const res = await fetch(`${baseUrl}/health`);
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
      return (await res.json()) as HealthResponse;
    },
  };
}
