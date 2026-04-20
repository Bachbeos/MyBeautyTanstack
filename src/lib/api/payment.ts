import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";

export type PaymentDto = {
  id: number;
  invoiceId: number;
  amount: number;
  paymentType: string;
  status: string;
  orderCode: number;
  paymentLinkId: string;
  checkoutUrl: string;
  qrCode: string; // base64 PNG
};

export const createPayment = (invoiceId: number): Promise<ApiResponse<PaymentDto>> =>
  axiosInstance
    .post<ApiResponse<PaymentDto>>(ENDPOINTS.payment.create, null, {
      params: { invoiceId }
    })
    .then((r) => r.data);
