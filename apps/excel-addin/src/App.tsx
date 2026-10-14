import { createApiClient, type HealthResponse } from "@repo/api-client";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { useEffect, useState } from "react";
import { useOfficeHost } from "@/lib/office";

const api = createApiClient("http://localhost:3000");

async function writeToSelection(text: string) {
  await Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    range.values = [[text]];
    await context.sync();
  });
}

export function App() {
  const office = useOfficeHost();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch((e: Error) => setBackendError(e.message));
  }, []);

  async function handleWrite() {
    setExcelError(null);
    try {
      await writeToSelection("Hello from the monorepo");
    } catch (e) {
      setExcelError(e instanceof Error ? e.message : String(e));
    }
  }

  const isExcel = office.status === "ready" && office.host === Office.HostType.Excel;

  return (
    <main className="flex flex-col gap-3 p-4 text-sm">
      <p>
        Office:{" "}
        {office.status === "loading"
          ? "not connected (expected outside Office)"
          : (office.host ?? "no host")}
      </p>

      <Card>Hello</Card>

      {backendError && <p>Backend unreachable: {backendError}</p>}
      {!backendError && !health && <p>Checking backend…</p>}
      {health && <p>Backend status: {health.status}</p>}

      <Button>Hi</Button>

      {isExcel && <Button onClick={handleWrite}>Write to selected cell</Button>}
      {excelError && <p>Excel error: {excelError}</p>}
    </main>
  );
}
