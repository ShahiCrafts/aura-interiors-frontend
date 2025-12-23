import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  resolve: {
    // Dedupe these packages to use the main project's versions
    // This is needed for file-linked packages like capacitor-arcore
    dedupe: ["three", "react", "react-dom"],
    alias: {
      // Ensure three is resolved from this project's node_modules
      three: path.resolve("./node_modules/three"),
    },
  },
  optimizeDeps: {
    // Include linked package dependencies for pre-bundling
    include: ["capacitor-arcore", "three"],
  },
});
