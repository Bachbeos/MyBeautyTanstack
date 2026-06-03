export type ApiResponse<T = any> = {
  code?: number;
  success: boolean;
  message: string;
  result?: T;
};
