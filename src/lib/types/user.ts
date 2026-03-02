import { type ID, toId } from "@/lib/types/id";

export type UserId = ID<"User", number>;

export const UserId = (v: number) => toId<"User", number>(v);
