import { queryOptions } from "@tanstack/react-query";
import {
  getCustomerByMonth,
  getCustomerBySource,
  getMonthlyRevenue,
  getFrequency,
  getCallHistoryAvg,
  getInterestBar,
  getCustomerSegment,
  getSegmentTrend,
  getRevenueByHourToday
} from "@/lib/api/report";

import type {
  ReportBaseParams,
  RevenueParams,
  FrequencyParams,
  CallHistoryAvgParams,
  InterestBarParams,
  SegmentTrendParams
} from "@/lib/types/report";
import { createKeys } from "@/lib/tanstack/query-key";

export const reportKeys = createKeys("report", {
  customerByMonth: (params: ReportBaseParams) => ["customerByMonth", params] as const,
  customerBySource: (params: ReportBaseParams) => ["customerBySource", params] as const,
  monthlyRevenue: (params: RevenueParams) => ["monthlyRevenue", params] as const,
  frequency: (params: FrequencyParams) => ["frequency", params] as const,
  callHistoryAvg: (params: CallHistoryAvgParams) => ["callHistoryAvg", params] as const,
  interestBar: (params: InterestBarParams) => ["interestBar", params] as const,
  customerSegment: (params: ReportBaseParams) => ["customerSegment", params] as const,
  segmentTrend: (params: SegmentTrendParams) => ["segmentTrend", params] as const,
  revenueByHourToday: () => ["revenueByHourToday"] as const
});

export const reportQueries = {
  customerByMonth: (params: ReportBaseParams) =>
    queryOptions({
      queryKey: reportKeys.customerByMonth(params),
      queryFn: ({ signal }) => getCustomerByMonth(params, signal)
    }),

  customerBySource: (params: ReportBaseParams) =>
    queryOptions({
      queryKey: reportKeys.customerBySource(params),
      queryFn: ({ signal }) => getCustomerBySource(params, signal)
    }),

  monthlyRevenue: (params: RevenueParams) =>
    queryOptions({
      queryKey: reportKeys.monthlyRevenue(params),
      queryFn: ({ signal }) => getMonthlyRevenue(params, signal)
    }),

  frequency: (params: FrequencyParams) =>
    queryOptions({
      queryKey: reportKeys.frequency(params),
      queryFn: ({ signal }) => getFrequency(params, signal)
    }),

  callHistoryAvg: (params: CallHistoryAvgParams) =>
    queryOptions({
      queryKey: reportKeys.callHistoryAvg(params),
      queryFn: ({ signal }) => getCallHistoryAvg(params, signal)
    }),

  interestBar: (params: InterestBarParams) =>
    queryOptions({
      queryKey: reportKeys.interestBar(params),
      queryFn: ({ signal }) => getInterestBar(params, signal)
    }),

  customerSegment: (params: ReportBaseParams) =>
    queryOptions({
      queryKey: reportKeys.customerSegment(params),
      queryFn: ({ signal }) => getCustomerSegment(params, signal)
    }),

  segmentTrend: (params: SegmentTrendParams) =>
    queryOptions({
      queryKey: reportKeys.segmentTrend(params),
      queryFn: ({ signal }) => getSegmentTrend(params, signal)
    }),

  revenueByHourToday: () =>
    queryOptions({
      queryKey: reportKeys.revenueByHourToday(),
      queryFn: ({ signal }) => getRevenueByHourToday(signal)
    })
};
