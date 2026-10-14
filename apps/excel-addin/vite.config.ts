import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { getHttpsServerOptions } from "office-addin-dev-certs";
import { defineConfig } from "vite";

export default defineConfig(async ({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3001,
    strictPort: true,
    https: command === "serve" ? await getHttpsServerOptions() : undefined,
  },
}));
