import { useEffect, useState } from "react";

export type OfficeHostState =
  | { status: "loading" }
  | { status: "ready"; host: Office.HostType | null };

export function useOfficeHost(): OfficeHostState {
  const [state, setState] = useState<OfficeHostState>({ status: "loading" });

  useEffect(() => {
    if (typeof Office === "undefined") return;

    Office.onReady()
      .then(({ host }) => setState({ status: "ready", host }))
      .catch((error: unknown) => {
        console.error("Office.js failed to initialize", error);
      });
  }, []);

  return state;
}
