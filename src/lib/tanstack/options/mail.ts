import { createKeys } from "@/lib/tanstack/query-key";

import { mutationOptions } from "@tanstack/react-query";
import { sendMail, type SendMailRequest } from "@/lib/api/mail";

import type { ApiResponse } from "@/lib/types/common";

export const mailKeys = createKeys("mail", {
  send: () => ["send"] as const
});

export const mailMutations = {
  send: () =>
    mutationOptions<ApiResponse<void>, Error, SendMailRequest>({
      mutationKey: mailKeys.send(),
      mutationFn: (body) => sendMail(body),
      meta: {
        successMessage: "Gửi email thành công"
      }
    })
};
