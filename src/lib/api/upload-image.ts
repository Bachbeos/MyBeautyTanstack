import { ENDPOINTS } from "@/lib/api/endpoints";
import { axiosInstance } from "@/lib/axios/instance";

export interface UploadFileResponse {
  code: number;
  message: string;
  result: string;
}

type UploadApiData = {
  code?: number;
  success?: boolean;
  message?: string;
  result?: unknown;
};

export async function uploadFile(file: File): Promise<UploadFileResponse | null> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post<UploadApiData>(
      ENDPOINTS.uploadImage.upload,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    const data = response.data;
    if (!data || typeof data.result !== "string") {
      return null;
    }

    const isSuccess = data.code === 200 || data.success === true;
    if (!isSuccess) {
      return null;
    }

    return {
      code: data.code ?? 200,
      message: data.message ?? "",
      result: data.result
    };
  } catch {
    return null;
  }
}
