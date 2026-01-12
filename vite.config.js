import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["three", "react", "react-dom"],
    alias: {
      three: path.resolve("./node_modules/three"),
    },
  },
  optimizeDeps: {
    include: ["capacitor-arcore", "three"],
  },
});
