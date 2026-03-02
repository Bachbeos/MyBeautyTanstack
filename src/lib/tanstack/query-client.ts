import { ErrorResponseWarper } from "@/lib/utils";
import { navigate } from "@/lib/tanstack/navigation";
import { MutationCache, QueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidatesQuery?: QueryKey[];
      successMessage?: string;
      errorMessage?: string;
      redirectTo?: string;
      replace?: boolean;
    };
  }
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage);
      }

      if (mutation.meta?.redirectTo) {
        navigate(mutation.meta.redirectTo, mutation.meta.replace);
      }
    },

    onError: (err: unknown, _vars, _ctx, mutation) => {
      const message = mutation.meta?.errorMessage ?? ErrorResponseWarper(err) ?? "Đã có lỗi xảy ra";

      toast.error(message);
    },

    onSettled: (_data, _error, _variables, _context, mutation) => {
      const keys = mutation.meta?.invalidatesQuery;
      if (!keys) return;

      const list = Array.isArray(keys) ? keys : [keys];

      list.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    }
  })
});
