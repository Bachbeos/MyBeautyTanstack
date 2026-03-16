import { toId, type ID } from "@/lib/types/id";

export type RoleId = ID<"Role", number>;
export const RoleId = (v: number) => toId<"Role", number>(v);

export type ProfileDto = {
  id: RoleId;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: number;
  alias?: string;
  subdistrictName?: string;
  cityName?: string;
  [key: string]: unknown;
};

export type ProfileUpdateRequest = {
  id: RoleId;
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  gender?: number;
  alias?: string;
  subdistrictName?: string;
  cityName?: string;
};
