import { axiosInstance } from "@/lib/axios/instance";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/lib/types/common";
import type {
  ReportBaseParams,
  RevenueParams,
  FrequencyParams,
  CallHistoryAvgParams,
  InterestBarParams,
  CustomerByMonthDto,
  CustomerBySourceDto,
  RevenueDataDto,
  FrequencyResponse,
  AvgInterestResponse,
  InterestBarDataDto,
  CustomerSegmentDto,
  SegmentTrendDto,
  SegmentTrendParams,
  RevenueByHourDto
} from "@/lib/types/report";

export const getCustomerByMonth = async (
  params: ReportBaseParams,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerByMonthDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerByMonthDto[]>>(ENDPOINTS.report.customerByMonth, {
    params,
    signal
  });
  return res.data;
};

export const getCustomerBySource = async (
  params: ReportBaseParams,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerBySourceDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerBySourceDto[]>>(ENDPOINTS.report.customerBySource, {
    params,
    signal
  });
  return res.data;
};

export const getMonthlyRevenue = async (
  params: RevenueParams,
  signal?: AbortSignal
): Promise<ApiResponse<RevenueDataDto>> => {
  const res = await axiosInstance.get<ApiResponse<RevenueDataDto>>(ENDPOINTS.report.revenueByMonth, {
    params,
    signal
  });
  return res.data;
};

export const getFrequency = async (
  params: FrequencyParams,
  signal?: AbortSignal
): Promise<ApiResponse<FrequencyResponse>> => {
  const res = await axiosInstance.get<ApiResponse<FrequencyResponse>>(ENDPOINTS.report.frequency, {
    params,
    signal
  });
  return res.data;
};

export const getCallHistoryAvg = async (
  params: CallHistoryAvgParams,
  signal?: AbortSignal
): Promise<ApiResponse<AvgInterestResponse>> => {
  const res = await axiosInstance.get<ApiResponse<AvgInterestResponse>>(ENDPOINTS.report.callHistoryAvg, {
    params,
    signal
  });
  return res.data;
};

export const getInterestBar = async (
  params: InterestBarParams,
  signal?: AbortSignal
): Promise<ApiResponse<InterestBarDataDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<InterestBarDataDto[]>>(ENDPOINTS.report.callHistoryInterest, {
    params,
    signal
  });
  return res.data;
};

export const getCustomerSegment = async (
  params: ReportBaseParams,
  signal?: AbortSignal
): Promise<ApiResponse<CustomerSegmentDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<CustomerSegmentDto[]>>(ENDPOINTS.report.customerSegment, {
    params,
    signal
  });
  return res.data;
};

export const getSegmentTrend = async (
  params: SegmentTrendParams,
  signal?: AbortSignal
): Promise<ApiResponse<SegmentTrendDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<SegmentTrendDto[]>>(ENDPOINTS.report.segmentTrend, {
    params,
    signal
  });
  return res.data;
};

export const getRevenueByHourToday = async (
  signal?: AbortSignal
): Promise<ApiResponse<RevenueByHourDto[]>> => {
  const res = await axiosInstance.get<ApiResponse<RevenueByHourDto[]>>(ENDPOINTS.report.revenueByHourToday, { signal });
  return res.data;
};
