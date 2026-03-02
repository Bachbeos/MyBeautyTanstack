import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function ErrorResponseWarper(err: unknown): string | null {
  if (typeof err !== "object" || !err) return null;

  if ("response" in err) {
    const r = err as any;

    if (r.response?.data?.message) return r.response.data.message;
    if (r.response?.data?.error) return r.response.data.error;
  }

  if ("message" in err) return String((err as any).message);

  return null;
}
