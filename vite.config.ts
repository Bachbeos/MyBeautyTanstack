import { type ConfigEnv, defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { loadEnv } from "vite";
export default ({ mode }: ConfigEnv) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    build: {
      minify: "esbuild",
      target: "es2017",
      sourcemap: false,
      cssCodeSplit: true
    },
    server: {
      port: 4200,
      host: true,
      allowedHosts: [
        process.env.VITE_SERVER_URL ? new URL(process.env.VITE_SERVER_URL).hostname : "localhost"
      ],
      watch: { usePolling: true, interval: 1000 }
    },
    preview: {
      port: 4200,
      host: process.env.VITE_SERVER_URL
        ? new URL(process.env.VITE_SERVER_URL).hostname
        : "localhost"
    },
    plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./src/assets")
      }
    }
  });
};
