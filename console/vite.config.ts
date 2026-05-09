import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { ServerResponse } from "http";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Empty + dev: same-origin /api with proxy to VITE_DEV_API_PROXY_TARGET (no CORS setup).
  // Non-empty: browser calls that origin (set QWENPAW_CORS_ORIGINS on backend if needed).
  const apiBaseUrl = env.VITE_API_BASE_URL ?? "";
  // When VITE_API_BASE_URL is empty, API calls hit the dev server as /api/... .
  // Proxy to the real backend so the browser stays same-origin (no CORS; backend
  // does not enable CORSMiddleware unless QWENPAW_CORS_ORIGINS is set).
  const devApiProxyTarget =
    env.VITE_DEV_API_PROXY_TARGET || "http://127.0.0.1:8088";

  return {
    define: {
      VITE_API_BASE_URL: JSON.stringify(apiBaseUrl),
      TOKEN: JSON.stringify(env.TOKEN || ""),
      MOBILE: false,
    },
    plugins: [react()],
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]__[hash:base64:5]",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      ...(mode === "development" && !apiBaseUrl
        ? {
            proxy: {
              "/api": {
                target: devApiProxyTarget,
                changeOrigin: true,
                configure(proxy) {
                  proxy.on("error", (err, _req, res) => {
                    const r = res as ServerResponse | undefined;
                    if (
                      r &&
                      typeof r.writeHead === "function" &&
                      !r.headersSent
                    ) {
                      const msg =
                        err instanceof Error ? err.message : String(err);
                      r.writeHead(502, {
                        "Content-Type": "application/json",
                      });
                      r.end(
                        JSON.stringify({
                          detail: `Development proxy cannot reach backend at ${devApiProxyTarget}. Start the QwenPaw server or set VITE_DEV_API_PROXY_TARGET in .env.development. (${msg})`,
                        }),
                      );
                    }
                  });
                },
              },
            },
          }
        : {}),
    },
    optimizeDeps: {
      include: ["diff"],
    },
    build: {
      // Output to QwenPaw's console directory,
      // so we don't need to copy files manually after build.
      // outDir: path.resolve(__dirname, "../src/qwenpaw/console"),
      // emptyOutDir: true,
      cssCodeSplit: true,
      sourcemap: mode !== "production",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router-dom/") ||
              id.includes("node_modules/scheduler/")
            ) {
              return "react-vendor";
            }
            // Ant Design + AgentScope design system (merged to avoid circular deps)
            if (
              id.includes("node_modules/antd/") ||
              id.includes("node_modules/antd-style/") ||
              id.includes("node_modules/@ant-design/") ||
              id.includes("node_modules/@agentscope-ai/")
            ) {
              return "ui-vendor";
            }
            // i18n
            if (
              id.includes("node_modules/i18next/") ||
              id.includes("node_modules/react-i18next/")
            ) {
              return "i18n-vendor";
            }
            // Markdown rendering
            if (
              id.includes("node_modules/react-markdown/") ||
              id.includes("node_modules/remark-gfm/") ||
              id.includes("node_modules/rehype") ||
              id.includes("node_modules/remark") ||
              id.includes("node_modules/unified/") ||
              id.includes("node_modules/mdast") ||
              id.includes("node_modules/hast") ||
              id.includes("node_modules/micromark")
            ) {
              return "markdown-vendor";
            }
            // Drag and drop
            if (id.includes("node_modules/@dnd-kit/")) {
              return "dnd-vendor";
            }
            // Utilities (dayjs, zustand, ahooks, etc.)
            if (
              id.includes("node_modules/dayjs/") ||
              id.includes("node_modules/zustand/") ||
              id.includes("node_modules/ahooks/") ||
              id.includes("node_modules/@vvo/tzdb/")
            ) {
              return "utils-vendor";
            }
          },
        },
      },
    },
  };
});
