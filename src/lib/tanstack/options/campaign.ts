import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { generateCampaign, getCampaignList } from "@/lib/api/campaign";
import type { ApiResponse } from "@/lib/types/common";
import { createKeys } from "@/lib/tanstack/query-key";
import type { ListCampaignRequest } from "@/lib/types/campaign";

// ==============================
// Keys
// ==============================
export const campaignKeys = createKeys("campaign", {
  list: () => ["list"] as const,
  generate: (id: number) => ["generate", id] as const
});

// ==============================
// Queries
// ==============================
export const campaignQueries = {
  list: (params: ListCampaignRequest) =>
    queryOptions<ApiResponse<any>>({
      queryKey: campaignKeys.list(),
      queryFn: ({ signal }) => getCampaignList(params, signal)
    })
};

// ==============================
// Mutations
// ==============================
export const campaignMutations = {
  generate: () =>
    mutationOptions<ApiResponse<any>, Error, number>({
      mutationKey: campaignKeys.generate(0),
      mutationFn: (id) => generateCampaign(id),
      meta: {
        successMessage: "Tạo campaign AI thành công",
        invalidatesQuery: [campaignKeys.list()]
      }
    })
};