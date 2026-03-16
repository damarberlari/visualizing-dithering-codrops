import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [glsl()],
  server: {
    port: 8080,
    open: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets"
  }
});
