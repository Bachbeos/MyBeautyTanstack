import { useAppForm } from "@/components/form/hooks";
import ModalSale from "@/components/features/sale/modal";
import { PaymentQrModal } from "@/components/features/sale/payment-qr-modal";
import { createDraftInvoice, createInvoice, updateDraftInvoice } from "@/lib/api/invoice";
import { createPayment } from "@/lib/api/payment";
import { batchUpsertBoughtProducts } from "@/lib/api/bought-product";
import { batchUpsertBoughtServices } from "@/lib/api/bought-service";
import { customerQueries } from "@/lib/tanstack/options/customer";
import { productQueries } from "@/lib/tanstack/options/product";
import { serviceQueries } from "@/lib/tanstack/options/service";
import { invoiceQueries } from "@/lib/tanstack/options/invoice";
import type { InvoiceDto, InvoiceId } from "@/lib/types/invoice";
import type {
  BoughtProductCreateRequest,
  BoughtProductId,
  BoughtProductUpdateRequest
} from "@/lib/types/bought-product";
import type { ProductDto } from "@/lib/types/product";
import type { ServiceDto } from "@/lib/types/service";
import type {
  BoughtServiceCreateRequest,
  BoughtServiceId,
  BoughtServiceUpdateRequest
} from "@/lib/types/bought-service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { usePermission } from "@/hooks/use-permission";

// paymentType từ InvoiceConstant
const PAYMENT_TRANSFER = 2;

type MenuType = "product" | "service";

type MenuItem = {
  id: number;
  key: string;
  name: string;
  type: MenuType;
  category: string;
  price: number;
  accent: string;
  avatar?: string;
};

type CartItem = MenuItem & {
  boughtProductId?: BoughtProductId;
  boughtServiceId?: BoughtServiceId;
  quantity: number;
};

type QrModalState = {
  invoiceId: number;
  qrCode: string;
  checkoutUrl: string;
  amount: number;
};

const PRODUCT_ACCENT = "#e0f2fe";
const SERVICE_ACCENT = "#dcfce7";

const mapProductToMenuItem = (item: ProductDto): MenuItem => ({
  id: Number(item.id),
  key: `product-${String(item.id)}`,
  name: item.name,
  type: "product",
  category: item.categoryName || "Sản phẩm",
  price: Number(item.price) || 0,
  accent: PRODUCT_ACCENT,
  avatar: item.avatar
});

const mapServiceToMenuItem = (item: ServiceDto): MenuItem => ({
  id: Number(item.id),
  key: `service-${String(item.id)}`,
  name: item.name,
  type: "service",
  category: item.categoryName || "Dịch vụ",
  price: Number(item.price) || 0,
  accent: SERVICE_ACCENT,
  avatar: item.avatar
});

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const isApiOk = (res: any) => res?.success === true || res?.code === 200;

export const Route = createFileRoute("/_crm/_sale/sale")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    invoiceId: Number(search.invoiceId) || undefined
  })
});

function RouteComponent() {
  const search = Route.useSearch();
  const invoiceIdParam = search.invoiceId;

  const [activeTab, setActiveTab] = useState<MenuType>("product");
  const [keyword, setKeyword] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalShown, setModalShown] = useState(false);
  const [draftInvoiceId, setDraftInvoiceId] = useState<number | null>(null);
  const [draftInvoice, setDraftInvoice] = useState<InvoiceDto | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  // QR Payment modal
  const [qrModal, setQrModal] = useState<QrModalState | null>(null);

  const customersInf = useInfiniteQuery(customerQueries.infinite({ limit: 10 }));

  const productQuery = useQuery({
    ...productQueries.list({ page: 1, limit: 1000, keyword: keyword.trim() || undefined }),
    enabled: activeTab === "product"
  });

  const serviceQuery = useQuery({
    ...serviceQueries.list({ page: 1, limit: 1000, keyword: keyword.trim() || undefined }),
    enabled: activeTab === "service"
  });

  const filteredItems = useMemo(() => {
    if (activeTab === "product")
      return (productQuery.data?.result?.items ?? []).map(mapProductToMenuItem);
    return (serviceQuery.data?.result?.items ?? []).map(mapServiceToMenuItem);
  }, [activeTab, productQuery.data?.result?.items, serviceQuery.data?.result?.items]);

  const isLoadingItems = activeTab === "product" ? productQuery.isLoading : serviceQuery.isLoading;
  const isErrorItems = activeTab === "product" ? productQuery.isError : serviceQuery.isError;

  const totalAmount = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const totalQuantity = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const customerOptions = useMemo(() => {
    const options = customersInf.data?.pages.flatMap((p) => p.result?.items ?? []) ?? [];
    return [
      { label: "Khách vãng lai", value: 0 },
      ...options.map((c) => ({ label: c.name, value: Number(c.id) }))
    ];
  }, [customersInf.data]);

  const invoiceDetailQuery = useQuery({
    ...invoiceQueries.draftDetail(invoiceIdParam as unknown as InvoiceId),
    enabled: !!invoiceIdParam
  }) as any;

  useEffect(() => {
    const data = invoiceDetailQuery.data as any;
    if (data?.result?.invoice || data?.result) {
      const invoice = data.result.invoice || data.result;
      const products = data.result.products || [];
      const services = data.result.services || [];

      if (invoice.customerId) customerForm.setFieldValue("customerId", invoice.customerId);
      setDraftInvoiceId(invoice.id);
      setDraftInvoice(invoice);

      const newProductsCart: CartItem[] = products.map((item: any) => ({
        id: item.productId || item.id,
        key: `product-${item.productId || item.id}`,
        name: item.productName || item.name || "Sản phẩm",
        type: "product",
        category: item.unitName || "Sản phẩm",
        price: Number(item.price) || 0,
        accent: PRODUCT_ACCENT,
        quantity: item.qty || 1,
        boughtProductId: item.id
      }));

      const newServicesCart: CartItem[] = services.map((item: any) => ({
        id: item.serviceId || item.id,
        key: `service-${item.serviceId || item.id}`,
        name: item.serviceName || item.name || "Dịch vụ",
        type: "service",
        category: item.unitName || "Dịch vụ",
        price: Number(item.price) || 0,
        accent: SERVICE_ACCENT,
        quantity: item.qty || 1,
        boughtServiceId: item.id
      }));

      setCart([...newProductsCart, ...newServicesCart]);
    }
  }, [invoiceDetailQuery.data]);

  const handleLoadMoreCustomers = () => {
    if (!customersInf.hasNextPage || customersInf.isFetchingNextPage) return;
    customersInf.fetchNextPage();
  };

  const customerForm = useAppForm({
    defaultValues: { customerId: "" as string | number },
    onSubmit: async () => {}
  });

  const selectedCustomerId = Number(customerForm.state.values.customerId) || 0;

  const handleCustomerValueChange = async (value: string | number | "") => {
    if (value === "") {
      setDraftInvoiceId(null);
      setDraftInvoice(null);
      setIsLoadingCustomer(false);
      return;
    }
    const customerId = Number(value);
    if (!Number.isFinite(customerId) || customerId < 0) {
      setDraftInvoiceId(null);
      setDraftInvoice(null);
      return;
    }
    setIsLoadingCustomer(true);
    setDraftInvoiceId(null);
    setDraftInvoice(null);
    try {
      const res = await createDraftInvoice(customerId);
      if (isApiOk(res) && res.result?.id) {
        setDraftInvoiceId(Number(res.result.id));
        setDraftInvoice(res.result);
      }
    } catch (error) {
      console.error("Error creating draft invoice:", error);
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const index = prev.findIndex((c) => c.key === item.key);
      if (index === -1) return [...prev, { ...item, quantity: 1 }];
      const next = [...prev];
      next[index] = { ...next[index], quantity: next[index].quantity + 1 };
      return next;
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const { canView } = usePermission("SALE");

  const buildDraftUpdatePayload = (values?: {
    discount?: number;
    discountCode?: string;
    fee?: number;
    paymentMethod?: number;
    voucherId?: number;
  }) => {
    if (!draftInvoiceId || !draftInvoice) return null;
    return {
      ...draftInvoice,
      id: draftInvoiceId as any,
      amount: totalAmount,
      discount: values?.discount ?? draftInvoice.discount ?? 0,
      voucherCode: values?.discountCode ?? draftInvoice.voucherCode ?? "",
      fee: values?.fee ?? totalAmount,
      paymentType: values?.paymentMethod ?? draftInvoice.paymentType ?? 1
    } as any;
  };

  const handleOpenModal = async () => {
    const payload = buildDraftUpdatePayload();
    if (!payload || draftInvoiceId == null) return;

    try {
      const productPayload: (BoughtProductCreateRequest | BoughtProductUpdateRequest)[] = cart
        .filter((i) => i.type === "product")
        .map((i) => ({
          invoiceId: draftInvoiceId,
          productId: i.id,
          unitId: 1,
          qty: i.quantity,
          price: i.price,
          fee: i.price * i.quantity,
          customerId: selectedCustomerId || 0,
          status: 0,
          note: "",
          id: i.boughtProductId ? i.boughtProductId : undefined
        }));

      const servicePayload: (BoughtServiceCreateRequest | BoughtServiceUpdateRequest)[] = cart
        .filter((i) => i.type === "service")
        .map((i) => ({
          invoiceId: draftInvoiceId,
          serviceId: i.id,
          qty: i.quantity,
          price: i.price,
          fee: i.price * i.quantity,
          customerId: selectedCustomerId || 0,
          status: 0,
          note: "",
          id: i.boughtServiceId ? i.boughtServiceId : undefined
        }));

      const [productBatchRes, serviceBatchRes] = await Promise.all([
        productPayload.length > 0 ? batchUpsertBoughtProducts(productPayload) : Promise.resolve(null),
        servicePayload.length > 0 ? batchUpsertBoughtServices(servicePayload) : Promise.resolve(null)
      ]);

      if (productBatchRes && !isApiOk(productBatchRes)) return;
      if (serviceBatchRes && !isApiOk(serviceBatchRes)) return;

      const productMap = new Map(productBatchRes?.result?.map((p) => [p.productId, p.id]) ?? []);
      const serviceMap = new Map(serviceBatchRes?.result?.map((s) => [s.serviceId, s.id]) ?? []);

      setCart((prev) =>
        prev.map((i) => {
          if (i.type === "product") {
            return { ...i, boughtProductId: productMap.get(i.id) ?? i.boughtProductId };
          }
          return { ...i, boughtServiceId: serviceMap.get(i.id) ?? i.boughtServiceId };
        })
      );

      const draftRes = await updateDraftInvoice(payload);
      if (isApiOk(draftRes)) setModalShown(true);
    } catch (error) {
      console.error("Error before opening modal:", error);
    }
  };

  // ── Xử lý submit form hóa đơn ─────────────────────────────────────────────
  // Flow:
  //   1. createInvoice → invoice UNPAID
  //   2. Nếu TRANSFER → createPayment → lấy QR → hiện PaymentQrModal
  //      Socket server sẽ emit "payment_done" khi PayOS webhook về
  //   3. Nếu CASH     → done ngay, toast success
  const handleSubmitModal = async (values: any) => {
    const payload = buildDraftUpdatePayload(values);
    if (!payload) return;

    try {
      const createPayload = { ...(payload as any), voucherId: values?.voucherId };
      const res = await createInvoice(createPayload);

      if (!isApiOk(res)) return;

      const invoice = res.result as InvoiceDto;
      const invoiceId = Number(invoice.id);
      const paymentType = Number(invoice.paymentType ?? createPayload.paymentType);

      setModalShown(false);
      clearCart();
      setDraftInvoiceId(null);
      setDraftInvoice(null);

      if (paymentType === PAYMENT_TRANSFER) {
        // Gọi API tạo PayOS payment → lấy QR
        const payRes = await createPayment(invoiceId);

        if (isApiOk(payRes) && payRes.result?.qrCode) {
          setQrModal({
            invoiceId,
            qrCode: payRes.result.qrCode,
            checkoutUrl: payRes.result.checkoutUrl ?? "",
            amount: invoice.fee ?? totalAmount
          });
        } else {
          // PayOS lỗi nhưng invoice đã tạo → vẫn báo thành công
          toast.success("Hóa đơn đã tạo. Vui lòng liên hệ để thanh toán.");
        }
      } else {
        // Tiền mặt → done ngay
        toast.success("Đơn hàng đã được tạo thành công!");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  if (canView === false) {
    return (
      <div className="page-wrapper">
        <div className="content py-5 text-center">
          <div className="mb-3">
            <i className="ti ti-lock fs-48 text-danger" />
          </div>
          <h4 className="fw-bold">Bạn không có quyền truy cập trang này</h4>
          <p className="text-muted">Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper sale-page">
      <div className="content pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">Bán hàng</h4>
            <div className="text-muted small">Bán hàng / Tạo đơn mới</div>
          </div>
          <div className="d-flex align-items-center gap-2" />
        </div>

        <div className="row g-3">
          {/* ── Danh mục ────────────────────────────────────────────────────── */}
          <div className="col-12 col-xxl-7 sale-col-menu">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-3 px-3 pb-2">
                <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                  <h6 className="mb-0">Danh mục sản phẩm và dịch vụ</h6>
                  <div className="input-icon-end position-relative sale-search-input">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm nhanh theo tên, danh mục..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-search" />
                    </span>
                  </div>
                </div>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === "product" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("product")}
                  >
                    Sản phẩm
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeTab === "service" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("service")}
                  >
                    Dịch vụ
                  </button>
                </div>
              </div>

              <div className="card-body p-3">
                {isLoadingItems && (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-loader-2 fs-1 d-block mb-2" />
                    Đang tải dữ liệu...
                  </div>
                )}
                {isErrorItems && (
                  <div className="text-center py-5 text-danger">
                    <i className="ti ti-alert-circle fs-1 d-block mb-2" />
                    Không tải được danh sách mặt hàng. Vui lòng thử lại.
                  </div>
                )}
                {!isLoadingItems && !isErrorItems && (
                  <>
                    <div className="row g-3">
                      {filteredItems.map((item) => (
                        <div className="col-12 col-sm-6 col-xl-4" key={item.key}>
                          <div
                            className="sale-item-card card border-0 shadow-sm h-100"
                            role="button"
                            tabIndex={0}
                            aria-label={`Thêm ${item.name} vào đơn`}
                            onClick={() => !isLoadingCustomer && addToCart(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (!isLoadingCustomer) addToCart(item);
                              }
                            }}
                            style={{ cursor: isLoadingCustomer ? "not-allowed" : "pointer" }}
                          >
                            {/* Cover */}
                            <div
                              className="sale-item-cover"
                              style={{
                                backgroundColor: item.accent,
                                backgroundImage: item.avatar ? `url(${item.avatar})` : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat"
                              }}
                            >
                              {!item.avatar && (
                                <div className="sale-item-icon-wrap">
                                  <i
                                    className={`ti ${item.type === "product" ? "ti-box" : "ti-sparkles"}`}
                                    aria-hidden="true"
                                  />
                                </div>
                              )}
                              <span
                                className={`sale-item-type-badge badge ${
                                  item.type === "product" ? "badge-soft-info" : "badge-soft-warning"
                                }`}
                              >
                                {item.category}
                              </span>
                            </div>

                            {/* Body */}
                            <div className="card-body d-flex flex-column p-3">
                              <h6 className="sale-item-name mb-1" title={item.name}>
                                {item.name}
                              </h6>
                              <div className="sale-item-price mt-auto mb-3">
                                {formatPrice(item.price)}
                              </div>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm w-100 sale-item-add-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                disabled={isLoadingCustomer}
                                tabIndex={-1}
                              >
                                <i className="ti ti-shopping-cart-plus me-1" aria-hidden="true" />
                                Thêm vào đơn
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredItems.length === 0 && (
                      <div className="text-center py-5 text-muted">
                        <i className="ti ti-package-off fs-1 d-block mb-2" />
                        Không có mặt hàng phù hợp với bộ lọc hiện tại.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Giỏ hàng ────────────────────────────────────────────────────── */}
          <div className="col-12 col-xxl-5 sale-col-cart">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 px-3 pt-3 pb-2">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">Đơn hàng hiện tại</h5>
                  <span className="badge badge-soft-info">{totalQuantity} sản phẩm</span>
                </div>
              </div>

              <div className="card-body d-flex flex-column p-3 sale-cart-body">
                <div className="mb-3">
                  <customerForm.AppField name="customerId">
                    {(f) => (
                      <f.Select
                        label="Khách hàng"
                        options={customerOptions}
                        onLoadMore={handleLoadMoreCustomers}
                        onValueChange={handleCustomerValueChange}
                        placeholder="Chọn khách hàng..."
                        className="sale-customer-select"
                        isClearable={false}
                      />
                    )}
                  </customerForm.AppField>
                  {customersInf.isError && (
                    <div className="small text-danger mt-1">
                      Không tải được danh sách khách hàng. Vui lòng thử lại.
                    </div>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-muted">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 sale-empty-icon">
                      <i className="ti ti-shopping-cart-off fs-1" />
                    </div>
                    <p className="mb-0 text-center">
                      Chọn sản phẩm ở bên trái để thêm vào giỏ hàng.
                    </p>
                  </div>
                ) : (
                  <div className="flex-grow-1 d-flex flex-column">
                    <div className="table-responsive flex-grow-1 sale-cart-scroll">
                      <table className="table align-middle mb-0">
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.key}>
                              <td className="ps-0">
                                <div className="fw-medium">{item.name}</div>
                                <div className="small text-muted">{formatPrice(item.price)}</div>
                              </td>
                              <td className="text-center sale-qty-col">
                                <div className="sale-qty-spinner">
                                  <button
                                    type="button"
                                    className="sale-qty-btn sale-qty-btn-minus"
                                    onClick={() => updateQuantity(item.key, -1)}
                                  >
                                    <i className="ti ti-minus" />
                                  </button>
                                  <span className="sale-qty-value">{item.quantity}</span>
                                  <button
                                    type="button"
                                    className="sale-qty-btn sale-qty-btn-plus"
                                    onClick={() => updateQuantity(item.key, 1)}
                                  >
                                    <i className="ti ti-plus" />
                                  </button>
                                </div>
                              </td>
                              <td className="text-end pe-0 fw-semibold">
                                {formatPrice(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="border-top mt-3 pt-3">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fs-5 fw-bold">Tổng cộng</span>
                    <span className="fs-4 fw-bold text-primary">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={cart.length === 0}
                      onClick={handleOpenModal}
                    >
                      Xác nhận đơn
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={clearCart}
                      disabled={cart.length === 0}
                    >
                      Hủy giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <ModalSale
        shown={modalShown}
        initialAmount={totalAmount}
        invoiceId={draftInvoiceId || undefined}
        onClose={() => setModalShown(false)}
        onSubmit={handleSubmitModal}
      />

      {qrModal && (
        <PaymentQrModal
          shown
          invoiceId={qrModal.invoiceId}
          qrCode={qrModal.qrCode}
          checkoutUrl={qrModal.checkoutUrl}
          amount={qrModal.amount}
          onClose={() => setQrModal(null)}
        />
      )}
    </div>
  );
}
