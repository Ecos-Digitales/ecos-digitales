import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react";
          }
          // Router
          if (id.includes("react-router")) {
            return "router";
          }
          // Supabase
          if (id.includes("@supabase/")) {
            return "supabase";
          }
          // TipTap — admin only
          if (id.includes("@tiptap/") || id.includes("prosemirror")) {
            return "tiptap";
          }
          // TanStack Query
          if (id.includes("@tanstack/")) {
            return "query";
          }
          // Radix UI
          if (id.includes("@radix-ui/")) {
            return "radix";
          }
          // date-fns
          if (id.includes("date-fns")) {
            return "datefns";
          }
          // lucide icons
          if (id.includes("lucide-react")) {
            return "icons";
          }
        },
      },
    },
  },
}));
