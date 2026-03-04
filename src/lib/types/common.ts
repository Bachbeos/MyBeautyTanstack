export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  result?: T;
};
