import { z } from "zod";

const envSchema = z.object({
  VITE_NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_SEVER_URL: z.url().default("http://localhost"),
  // VITE_API_URL: z.url().default("http://localhost:9100"),
  VITE_API_URL: z.url().default("https://be.aeoc.io.vn/api"),
  // VITE_SOCKET_URL: z.url().default("http://localhost:9090"),
  VITE_SOCKET_URL: z.url().default("https://be.aeoc.io.vn/socket")
});

const env = envSchema.parse(import.meta.env);

export default env;
