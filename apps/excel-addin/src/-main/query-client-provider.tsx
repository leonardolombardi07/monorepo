import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from "@tanstack/react-query";

export const queryClient = new QueryClient();

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>;
}
