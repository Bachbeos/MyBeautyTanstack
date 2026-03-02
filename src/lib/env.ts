import { z } from "zod";

const envSchema = z.object({
  VITE_NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_SEVER_URL: z.url().default("http://localhost"),
  VITE_API_URL: z.url().default("http://localhost:8080")
});

const env = envSchema.parse(import.meta.env);

export default env;
