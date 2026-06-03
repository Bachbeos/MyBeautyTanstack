import { useState, useMemo } from "react";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Select from "react-select";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

import { DataTable } from "@/components/table/data-table";
import { AsyncBoundary } from "@/components/async-boundary";
import RefreshButton from "@/components/refresh/refresh";
import CollapseButton from "@/components/collapse/collapse-button";

import { reportQueries, reportKeys } from "@/lib/tanstack/options/report";
import { triggerCustomerSegmentRecompute } from "@/lib/api/report";
import type { FrequencyItemDto, AvgInterestItemDto, SegmentRecomputeProgressDto } from "@/lib/types/report";

export const Route = createFileRoute('/_crm/_report/report')({
  component: RouteComponent,
});

const freqColumnHelper = createColumnHelper<FrequencyItemDto>();
const interestColumnHelper = createColumnHelper<AvgInterestItemDto>();

const filterSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    border: state.isFocused ? "1.6px solid #dc3545" : "1px solid #dee2e6",
    boxShadow: "none",
    "&:hover": { border: "1.6px solid #dc3545" },
    minHeight: "32px",
    height: "32px",
    minWidth: "110px",
    borderRadius: "0.25rem",
    cursor: "pointer"
  }),
  valueContainer: (base: any) => ({ ...base, padding: "0 8px" }),
  input: (base: any) => ({ ...base, margin: 0, padding: 0 }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base: any) => ({ ...base, padding: "4px" }),
  placeholder: (base: any) => ({ ...base, fontSize: 13 }),
  option: (base: any, state: any) => ({ 
    ...base, 
    fontSize: 13,
    backgroundColor: state.isSelected ? "#dc3545" : state.isFocused ? "#ffe5e6" : "white",
    "&:active": { backgroundColor: "#dc3545" }
  }),
  singleValue: (base: any) => ({ ...base, fontSize: 13, color: "#212529" }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
};

const filterSelectTheme = (theme: any) => ({
  ...theme,
  colors: { ...theme.colors, primary: "#dc3545" }
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );
 
  const { canView } = usePermission("REPORT");

  const [freqPageIndex, setFreqPageIndex] = useState(0);
  const [freqPageSize, setFreqPageSize] = useState(10);
  
  const [interestPageIndex, setInterestPageIndex] = useState(0);
  const [interestPageSize, setInterestPageSize] = useState(10);

  const [minInterest] = useState(3);
  const [monthsBack, setMonthsBack] = useState<6 | 12>(6);

  const monthQuery = useQuery(reportQueries.customerByMonth({ year: selectedYear }));
  const sourceQuery = useQuery(reportQueries.customerBySource({ year: selectedYear }));
  
  const freqQuery = useQuery(
    reportQueries.frequency({
      year: selectedYear,
      month: selectedMonth,
      page: freqPageIndex + 1,
      limit: freqPageSize
    })
  );

  const interestQuery = useQuery(
    reportQueries.callHistoryAvg({
      year: selectedYear,
      month: selectedMonth,
      page: interestPageIndex + 1,
      limit: interestPageSize
    })
  );

  const barQuery = useQuery(reportQueries.interestBar({ year: selectedYear, minAvgInterest: minInterest }));
  const segmentQuery = useQuery(reportQueries.customerSegment({ year: selectedYear }));
  const trendQuery = useQuery(reportQueries.segmentTrend({ monthsBack }));
  const revenueHourQuery = useQuery(reportQueries.revenueByHourToday());
  const segmentRecomputeLatestQuery = useQuery(reportQueries.customerSegmentRecomputeLatest());

  const recomputeMutation = useMutation({
    mutationFn: () => triggerCustomerSegmentRecompute(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys._root });
    }
  });

  const latestRecompute: SegmentRecomputeProgressDto | undefined = segmentRecomputeLatestQuery.data?.result;
  const isRecomputing = latestRecompute?.status === "RUNNING";
  const recomputeProgress = isRecomputing
    ? Math.min(100, Math.max(0, Math.round(((latestRecompute.processedChunks ?? 0) / Math.max(latestRecompute.totalChunks ?? 1, 1)) * 100)))
    : 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: reportKeys._root });
  };

  const handleRecomputeSegment = () => {
    recomputeMutation.mutate();
  };

  const handleCollapse = () => {
    document.body.classList.toggle("header-collapse");
    setIsHeaderCollapsed(document.body.classList.contains("header-collapse"));
  };

  const customerByMonthData = useMemo(() => {
    const data = monthQuery.data?.result ?? [];
    const filledData = new Array(12).fill(0);
    data.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        filledData[item.month - 1] = item.totalCustomer;
      }
    });
    return filledData;
  }, [monthQuery.data]);

  const { customerBySourceLabels, customerBySourceSeries } = useMemo(() => {
    const data = sourceQuery.data?.result ?? [];
    return {
      customerBySourceLabels: data.map((i) => i.sourceName),
      customerBySourceSeries: data.map((i) => i.totalCustomer)
    };
  }, [sourceQuery.data]);

  const interestChartData = useMemo(() => {
    const data = barQuery.data?.result ?? [];
    const total = new Array(12).fill(0);
    const high = new Array(12).fill(0);

    data.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        total[item.month - 1] = item.totalCustomer;
        high[item.month - 1] = item.highInterestCustomer;
      }
    });

    return { total, high };
  }, [barQuery.data]);

  const { segmentLabels, segmentSeries } = useMemo(() => {
    const data = segmentQuery.data?.result ?? [];
    const labelMapping: Record<string, string> = {
      CHURNED: "Đã rời bỏ",
      POTENTIAL: "Tiềm năng",
      AT_RISK: "Nguy cơ rời bỏ",
      VIP: "VIP"
    };

    return {
      segmentLabels: data.map((i) => labelMapping[i.segmentCode] || i.segmentCode),
      segmentSeries: data.map((i) => i.totalCustomer)
    };
  }, [segmentQuery.data]);

  const { trendPeriods, trendSeries } = useMemo(() => {
    const data = trendQuery.data?.result ?? [];
    const segmentLabelMapping: Record<string, string> = {
      CHURNED: "Đã rời bỏ",
      POTENTIAL: "Tiềm năng",
      AT_RISK: "Nguy cơ rời bỏ",
      VIP: "VIP",
      LOYAL: "Trung thành"
    };
    const segmentColorMapping: Record<string, string> = {
      CHURNED: "#6c757d",
      POTENTIAL: "#2F80ED",
      AT_RISK: "#FFA201",
      VIP: "#E41F07",
      LOYAL: "#1ABE17"
    };

    // Collect all unique periods (sorted) and segments
    const periodSet = new Set<string>();
    const segmentSet = new Set<string>();
    data.forEach((d) => {
      periodSet.add(d.period);
      segmentSet.add(d.segmentCode);
    });
    const periods = Array.from(periodSet).sort();
    const segments = Array.from(segmentSet);

    // Build a map for quick lookup
    const lookup: Record<string, number> = {};
    data.forEach((d) => {
      lookup[`${d.period}_${d.segmentCode}`] = d.totalCustomer;
    });

    const series = segments.map((seg) => ({
      name: segmentLabelMapping[seg] || seg,
      color: segmentColorMapping[seg],
      data: periods.map((p) => lookup[`${p}_${seg}`] ?? 0)
    }));

    return { trendPeriods: periods, trendSeries: series };
  }, [trendQuery.data]);

  const leadsByYearOptions: ApexOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"] },
    yaxis: { title: { text: "Số lượng khách hàng" } },
    fill: { opacity: 1 },
    colors: ["#E41F07"],
    tooltip: { y: { formatter: (val) => val + " Khách hàng" } }
  };

  const leadsBySourceOptions: ApexOptions = {
    chart: { type: "donut", height: 350 },
    labels: customerBySourceLabels,
    colors: ["#E41F07", "#FFA201", "#1ABE17", "#2F80ED", "#6c757d"],
    legend: { position: "bottom" },
    noData: { text: "Không có dữ liệu" }
  };

  const interestCompareOptions: ApexOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"] },
    fill: { opacity: 1 },
    colors: ["#2F80ED", "#FFA201"],
    legend: { position: "top" },
    tooltip: { y: { formatter: (val) => val + " khách hàng" } }
  };

  const segmentOptions: ApexOptions = {
    chart: { type: "donut", height: 350 },
    labels: segmentLabels,
    colors: ["#6c757d", "#2F80ED", "#FFA201", "#E41F07", "#1ABE17"],
    legend: { position: "bottom" },
    noData: { text: "Không có dữ liệu" }
  };

  const trendOptions: ApexOptions = {
    chart: { type: "line", height: 350, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    markers: { size: 4 },
    xaxis: { categories: trendPeriods, title: { text: "Tháng" } },
    yaxis: { title: { text: "Số khách hàng" } },
    legend: { position: "top" },
    tooltip: { y: { formatter: (val) => val.toLocaleString("vi-VN") + " khách hàng" } },
    noData: { text: "Không có dữ liệu" }
  };

  const revenueByHourData = useMemo(() => {
    const data = revenueHourQuery.data?.result ?? [];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const lookupAmount: Record<number, number> = {};
    const lookupInvoices: Record<number, number> = {};
    data.forEach((d) => {
      lookupAmount[d.hour] = d.totalAmount;
      lookupInvoices[d.hour] = d.totalInvoice;
    });

    return {
      categories: hours.map((h) => `${String(h).padStart(2, "0")}h`),
      seriesData: hours.map((h) => ({
        x: `${String(h).padStart(2, "0")}h`,
        y: lookupAmount[h] ?? 0,
        invoices: lookupInvoices[h] ?? 0
      }))
    };
  }, [revenueHourQuery.data]);

  const revenueByHourOptions: ApexOptions = {
    chart: { type: "bar", height: 300, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "60%", borderRadius: 3 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: revenueByHourData.categories, title: { text: "Giờ trong ngày" } },
    yaxis: {
      title: { text: "Doanh thu (VNĐ)" },
      labels: {
        formatter: (val) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(val)
      }
    },
    fill: { opacity: 1 },
    colors: ["#1ABE17"],
    tooltip: {
      y: {
        formatter: (val: any, opts?: any): string => {
          if (!opts) return String(val);
          const { seriesIndex, dataPointIndex, w } = opts;
          const revenue = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
          }).format(val);
          const seriesData = w.config.series[seriesIndex].data[dataPointIndex];
          const invoices = seriesData?.invoices || 0;
          return `${revenue} (${invoices} hóa đơn)`;
        }
      }
    }
  };

  const freqColumns = useMemo(() => [
    freqColumnHelper.accessor("customerName", {
      header: "Tên khách hàng",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="d-flex align-items-center">
            <span className="avatar avatar-sm rounded-circle border me-2 bg-light text-primary d-flex justify-content-center align-items-center fw-bold">
              {row.customerName.charAt(0).toUpperCase()}
            </span>
            <span className="fs-14 fw-medium text-dark">{row.customerName}</span>
          </div>
        );
      }
    }),
    freqColumnHelper.accessor("totalInvoice", {
      header: "Số hóa đơn",
      cell: (info) => <div className="text-center">{info.getValue()}</div>,
      meta: { className: "text-center w-1" }
    }),
    freqColumnHelper.accessor("totalFee", {
      header: "Tổng chi tiêu",
      cell: (info) => (
        <span className="fw-medium text-success">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(info.getValue() || 0)}
        </span>
      ),
      meta: { className: "text-end" }
    }),
    freqColumnHelper.accessor("avgFee", {
      header: "Trung bình / Hóa đơn",
      cell: (info) => (
        <span className="fw-medium">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(info.getValue() || 0)}
        </span>
      ),
      meta: { className: "text-end" }
    })
  ], []);

  const freqData = freqQuery.data?.result?.items ?? [];
  const freqTotal = freqQuery.data?.result?.total ?? 0;

  const freqTable = useReactTable({
    data: freqData,
    columns: freqColumns,
    state: { pagination: { pageIndex: freqPageIndex, pageSize: freqPageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: freqPageIndex, pageSize: freqPageSize });
        setFreqPageIndex(newState.pageIndex);
        setFreqPageSize(newState.pageSize);
      }
    },
    manualPagination: true,
    pageCount: Math.ceil(freqTotal / freqPageSize),
    getCoreRowModel: getCoreRowModel()
  });

  const interestColumns = useMemo(() => [
    interestColumnHelper.accessor("customerName", {
      header: "Tên khách hàng",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="d-flex align-items-center">
            <span className="avatar avatar-sm rounded-circle border me-2 bg-light text-primary d-flex justify-content-center align-items-center fw-bold">
              {row.customerName.charAt(0).toUpperCase()}
            </span>
            <span className="fs-14 fw-medium text-dark">{row.customerName}</span>
          </div>
        );
      }
    }),
    interestColumnHelper.accessor("totalCall", {
      header: "Tổng cuộc gọi",
      cell: (info) => <div className="text-center">{info.getValue()}</div>,
      meta: { className: "text-center w-1" }
    }),
    interestColumnHelper.accessor("avgInterestLevel", {
      header: "Mức quan tâm TB",
      cell: (info) => {
        const level = info.getValue() || 0;
        return (
          <div className="progress" style={{ height: "8px", width: "100%", maxWidth: "120px" }}>
            <div
              className={`progress-bar ${level > 3 ? "bg-success" : "bg-warning"}`}
              style={{ width: `${(Math.min(level, 5) / 5) * 100}%` }}
            ></div>
          </div>
        );
      }
    })
  ], []);

  const interestData = interestQuery.data?.result?.items ?? [];
  const interestTotal = interestQuery.data?.result?.total ?? 0;

  const interestTable = useReactTable({
    data: interestData,
    columns: interestColumns,
    state: { pagination: { pageIndex: interestPageIndex, pageSize: interestPageSize } },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: interestPageIndex, pageSize: interestPageSize });
        setInterestPageIndex(newState.pageIndex);
        setInterestPageSize(newState.pageSize);
      }
    },
    manualPagination: true,
    pageCount: Math.ceil(interestTotal / interestPageSize),
    getCoreRowModel: getCoreRowModel()
  });

  const yearOptions = [0, 1, 2, 3, 4].map((offset) => currentYear - offset);
  const reactSelectYearOptions = yearOptions.map(y => ({ value: y, label: `Năm ${y}` }));
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const reactSelectMonthOptions = monthOptions.map(m => ({ value: m, label: `Tháng ${m}` }));

  if (canView === false) {
    return (
      <div className="page-wrapper">
        <div className="content py-5 text-center">
          <div className="mb-3">
            <i className="ti ti-lock fs-48 text-danger"></i>
          </div>
          <h4 className="fw-bold">Bạn không có quyền truy cập trang này</h4>
          <p className="text-muted">Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">Báo cáo & Thống kê</h4>
            <div className="text-muted small">Báo cáo / Báo cáo & Thống kê</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <Can I="VIEW" a="COMPUTE_SEGMENT">
              <button
                className="btn btn-danger btn-sm d-inline-flex align-items-center gap-2"
                onClick={handleRecomputeSegment}
                disabled={recomputeMutation.isPending || isRecomputing}
              >
                {recomputeMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Đang khởi tạo...
                  </>
                ) : isRecomputing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Tính toán lại phân khúc {recomputeProgress}%
                  </>
                ) : (
                  <>Tính toán lại phân khúc</>
                )}
              </button>
            </Can>
            <RefreshButton onRefresh={handleRefresh} />
            <CollapseButton onCollapse={handleCollapse} active={isHeaderCollapsed} />
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-7">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center pt-3 px-3">
                <h6 className="mb-0 fw-semibold">Khách hàng theo năm</h6>
                <Select
                  options={reactSelectYearOptions}
                  value={reactSelectYearOptions.find(opt => opt.value === selectedYear)}
                  onChange={(opt) => setSelectedYear(opt?.value || currentYear)}
                  styles={filterSelectStyles}
                  theme={filterSelectTheme}
                  blurInputOnSelect
                  isSearchable={false}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  className="shadow-sm d-inline-block"
                />
              </div>
              <div className="card-body p-2">
                <AsyncBoundary status={monthQuery.status} error={monthQuery.error} onRetry={() => monthQuery.refetch()} data={true}>
                  {() => <Chart options={leadsByYearOptions} series={[{ name: "Khách hàng", data: customerByMonthData }]} type="bar" height={350} />}
                </AsyncBoundary>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center pt-3 px-3">
                <h6 className="mb-0 fw-semibold">Nguồn khách hàng</h6>
                <Select
                  options={reactSelectYearOptions}
                  value={reactSelectYearOptions.find(opt => opt.value === selectedYear)}
                  onChange={(opt) => setSelectedYear(opt?.value || currentYear)}
                  styles={filterSelectStyles}
                  theme={filterSelectTheme}
                  blurInputOnSelect
                  isSearchable={false}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  className="shadow-sm d-inline-block"
                />
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center p-2">
                <AsyncBoundary status={sourceQuery.status} error={sourceQuery.error} onRetry={() => sourceQuery.refetch()} data={true}>
                  {() => <Chart options={leadsBySourceOptions} series={customerBySourceSeries} type="donut" height={350} />}
                </AsyncBoundary>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0 pt-3 px-3">
                <h6 className="mb-0 fw-semibold">Doanh thu theo giờ hôm nay</h6>
              </div>
              <div className="card-body p-2">
                <AsyncBoundary status={revenueHourQuery.status} error={revenueHourQuery.error} onRetry={() => revenueHourQuery.refetch()} data={true}>
                  {() => (
                    <Chart
                      options={revenueByHourOptions}
                      series={[{ name: "Doanh thu", data: revenueByHourData.seriesData }]}
                      type="bar"
                      height={300}
                    />
                  )}
                </AsyncBoundary>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0 pt-3 px-3">
                <h6 className="mb-0 fw-semibold">So sánh mức độ quan tâm (min: {minInterest})</h6>
              </div>
              <div className="card-body p-2">
                <AsyncBoundary status={barQuery.status} error={barQuery.error} onRetry={() => barQuery.refetch()} data={true}>
                  {() => (
                    <Chart
                      options={interestCompareOptions}
                      series={[
                        { name: "Tổng khách hàng", data: interestChartData.total },
                        { name: `Quan tâm > ${minInterest}`, data: interestChartData.high },
                      ]}
                      type="bar"
                      height={300}
                    />
                  )}
                </AsyncBoundary>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center pt-3 px-3">
                <h6 className="mb-0 fw-semibold">Phân khúc khách hàng</h6>
                <Select
                  options={reactSelectYearOptions}
                  value={reactSelectYearOptions.find(opt => opt.value === selectedYear)}
                  onChange={(opt) => setSelectedYear(opt?.value || currentYear)}
                  styles={filterSelectStyles}
                  theme={filterSelectTheme}
                  blurInputOnSelect
                  isSearchable={false}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  className="shadow-sm d-inline-block"
                />
              </div>
              <div className="card-body p-2 d-flex flex-column align-items-center justify-content-center">
                <AsyncBoundary status={segmentQuery.status} error={segmentQuery.error} onRetry={() => segmentQuery.refetch()} data={true}>
                  {() => <Chart options={segmentOptions} series={segmentSeries} type="donut" height={350} />}
                </AsyncBoundary>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center pt-3 px-3">
                <h6 className="mb-0 fw-semibold">Xu hướng phân khúc khách hàng</h6>
                <div className="d-flex gap-2">
                  {([6, 12] as const).map((m) => (
                    <button
                      key={m}
                      className={`btn btn-sm ${monthsBack === m ? "btn-danger" : "btn-outline-secondary"}`}
                      onClick={() => setMonthsBack(m)}
                    >
                      {m} tháng
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body p-2">
                <AsyncBoundary status={trendQuery.status} error={trendQuery.error} onRetry={() => trendQuery.refetch()} data={true}>
                  {() => <Chart options={trendOptions} series={trendSeries} type="line" height={350} />}
                </AsyncBoundary>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-0 mb-4">
          <div className="card-header bg-white d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <h5 className="mb-0 fw-semibold">Tần suất mua hàng</h5>
          </div>
          <div className="card-body p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="d-flex align-items-center me-3">
                <span className="me-2 fw-medium small text-muted">Tháng:</span>
                <Select
                  options={reactSelectMonthOptions}
                  value={reactSelectMonthOptions.find(opt => opt.value === selectedMonth)}
                  onChange={(opt) => {
                    if (opt) {
                      setSelectedMonth(opt.value);
                      setFreqPageIndex(0);
                      setInterestPageIndex(0);
                    }
                  }}
                  styles={filterSelectStyles}
                  theme={filterSelectTheme}
                  blurInputOnSelect
                  isSearchable={false}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                />
              </div>
              <div className="d-flex align-items-center">
                <span className="me-2 fw-medium small text-muted">Năm:</span>
                <Select
                  options={reactSelectYearOptions}
                  value={reactSelectYearOptions.find(opt => opt.value === selectedYear)}
                  onChange={(opt) => {
                    if (opt) {
                      setSelectedYear(opt.value);
                      setFreqPageIndex(0);
                      setInterestPageIndex(0);
                    }
                  }}
                  styles={filterSelectStyles}
                  theme={filterSelectTheme}
                  blurInputOnSelect
                  isSearchable={false}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                />
              </div>
            </div>

            <AsyncBoundary status={freqQuery.status} error={freqQuery.error} onRetry={() => freqQuery.refetch()} data={freqData}>
               {() => <DataTable table={freqTable} filterable={true} filterKey="customerName" filterKeyPlaceholder="Tìm khách hàng..." />}
            </AsyncBoundary>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-0 mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0 fw-semibold">Chi tiết quan tâm theo cuộc gọi</h5>
          </div>
          <div className="card-body p-3">
            <AsyncBoundary status={interestQuery.status} error={interestQuery.error} onRetry={() => interestQuery.refetch()} data={interestData}>
               {() => <DataTable table={interestTable} filterable={true} filterKey="customerName" filterKeyPlaceholder="Tìm khách hàng..." />}
            </AsyncBoundary>
          </div>
        </div>

      </div>
    </div>
  );
}
