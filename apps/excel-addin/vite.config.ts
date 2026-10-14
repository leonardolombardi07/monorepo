import react from "@vitejs/plugin-react";
import { getHttpsServerOptions } from "office-addin-dev-certs";
import { defineConfig } from "vite";

export default defineConfig(async ({ command }) => ({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    https: command === "serve" ? await getHttpsServerOptions() : undefined,
  },
}));
