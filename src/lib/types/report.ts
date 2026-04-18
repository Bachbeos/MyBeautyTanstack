import type { Page, PageMeta } from "@/lib/types/paging";

export type ReportBaseParams = {
  year: number;
  [key: string]: unknown;
};

export type RevenueParams = ReportBaseParams & {
  month?: number;
};

export type FrequencyParams = ReportBaseParams & {
  month?: number;
} & Partial<PageMeta>;

export type CallHistoryAvgParams = {
  year: number;
  month?: number;
  keyword?: string;
} & Partial<PageMeta>;

export type InterestBarParams = {
  year: number;
  minAvgInterest: number;
};

export type CustomerByMonthDto = {
  month: number;
  totalCustomer: number;
};

export type CustomerBySourceDto = {
  sourceId: number;
  sourceName: string;
  totalCustomer: number;
};

export type RevenueDataDto = {
  year: number;
  month: number;
  totalRevenue: number;
};

export type FrequencyItemDto = {
  customerId: number;
  customerName: string;
  totalInvoice: number;
  totalFee: number;
  avgFee: number;
  [key: string]: unknown;
};

export type FrequencyResponse = Page<FrequencyItemDto> & { size?: number };

export type AvgInterestItemDto = {
  customerId: number;
  customerName: string;
  totalCall: number;
  avgInterestLevel: number;
  [key: string]: unknown;
};

export type AvgInterestResponse = Page<AvgInterestItemDto> & { size?: number };

export type InterestBarDataDto = {
  month: number;
  totalCustomer: number;
  highInterestCustomer: number;
};

export type CustomerSegmentDto = {
  segmentCode: string;
  totalCustomer: number;
};

export type SegmentTrendDto = {
  period: string;
  segmentCode: string;
  totalCustomer: number;
};

export type SegmentTrendParams = {
  monthsBack: number;
};

export type SegmentRecomputeProgressDto = {
  runId: string;
  branchId: number | null;
  status: string;
  totalCustomers: number | null;
  chunkSize: number | null;
  totalChunks: number | null;
  processedChunks: number | null;
  processedCustomers: number | null;
  errorCount: number | null;
  nextChunkIndex: number | null;
  resumeFromChunkIndex: number | null;
  resumable: boolean | null;
  message: string | null;
  startedAtEpochMs: number | null;
  lastUpdatedAtEpochMs: number | null;
};

export type RevenueByHourDto = {
  hour: number;
  totalInvoice: number;
  totalAmount: number;
};
