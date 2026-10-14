import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { getHttpsServerOptions } from "office-addin-dev-certs";
import { defineConfig } from "vite";

/** Must match every `https://localhost:3000` URL in `manifest.xml`. */
const DEV_SERVER_PORT = 3000;

/** Resolves a path relative to this file, so the config works from any cwd (e.g. Turbo). */
function fromRoot(path: string) {
  return fileURLToPath(new URL(path, import.meta.url));
}

export default defineConfig(async ({ command }) => ({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
    },
  },
  plugins: [
    // Must come before '@vitejs/plugin-react'.
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: fromRoot("./src/routes"),
      generatedRouteTree: fromRoot("./src/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: "localhost",
    port: DEV_SERVER_PORT,
    // Fail instead of silently moving to another port the manifest doesn't know about.
    strictPort: true,
    /*
     * Office only loads add-ins over HTTPS. This generates a localhost
     * certificate signed by a dev CA (installed into the Windows trust
     * store the first time, with a confirmation prompt).
     */
    https: command === "serve" ? await getHttpsServerOptions() : undefined,
  },
}));
