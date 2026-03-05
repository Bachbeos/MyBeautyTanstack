import { mutationOptions } from "@tanstack/react-query";
import { createKeys } from "@/lib/tanstack/query-key";
import type { ApiResponse } from "@/lib/types/common";
import type { ProfileDto, ProfileUpdateRequest } from "@/lib/types/profile";
import { upsertProfile } from "@/lib/api/profile";

export const roleKeys = createKeys("profile", {
  update: () => ["update"] as const
});

export const roleMutations = {
  update: () =>
    mutationOptions<ApiResponse<ProfileDto>, Error, ProfileUpdateRequest>({
      mutationKey: roleKeys.update(),
      mutationFn: (body) => upsertProfile(body),
      meta: { successMessage: "Cập nhật hồ sơ thành công", invalidatesQuery: [] }
    })
};
