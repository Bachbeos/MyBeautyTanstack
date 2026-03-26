import { useAppForm } from "@/components/form/hooks";
import ModalSale from "@/components/features/sale/modal";
import { createDraftInvoice, updateDraftInvoice } from "@/lib/api/invoice";
import { upsertBoughtProduct } from "@/lib/api/bought-product";
import { customerQueries } from "@/lib/tanstack/options/customer";
import { productQueries } from "@/lib/tanstack/options/product";
import { serviceQueries } from "@/lib/tanstack/options/service";
import type { ProductDto } from "@/lib/types/product";
import type { ServiceDto } from "@/lib/types/service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

type MenuType = "product" | "service";

type MenuItem = {
  id: number;
  key: string;
  name: string;
  type: MenuType;
  category: string;
  price: number;
  accent: string;
};

type CartItem = MenuItem & {
  quantity: number;
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
  accent: PRODUCT_ACCENT
});

const mapServiceToMenuItem = (item: ServiceDto): MenuItem => ({
  id: Number(item.id),
  key: `service-${String(item.id)}`,
  name: item.name,
  type: "service",
  category: item.categoryName || "Dịch vụ",
  price: Number(item.price) || 0,
  accent: SERVICE_ACCENT
});

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export const Route = createFileRoute("/_crm/_sale/sale")({
  component: RouteComponent
});

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<MenuType>("product");
  const [keyword, setKeyword] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalShown, setModalShown] = useState(false);
  const [draftInvoiceId, setDraftInvoiceId] = useState<number | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

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
    if (activeTab === "product") {
      return (productQuery.data?.result?.items ?? []).map(mapProductToMenuItem);
    }

    return (serviceQuery.data?.result?.items ?? []).map(mapServiceToMenuItem);
  }, [activeTab, productQuery.data?.result?.items, serviceQuery.data?.result?.items]);

  const isLoadingItems = activeTab === "product" ? productQuery.isLoading : serviceQuery.isLoading;
  const isErrorItems = activeTab === "product" ? productQuery.isError : serviceQuery.isError;

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalQuantity = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const customerOptions = useMemo(() => {
    const options = customersInf.data?.pages.flatMap((page) => page.result?.items ?? []) ?? [];
    return [
      { label: "Khách vãng lai", value: 0 },
      ...options.map((customer) => ({ label: customer.name, value: Number(customer.id) }))
    ];
  }, [customersInf.data]);

  const handleLoadMoreCustomers = () => {
    if (!customersInf.hasNextPage || customersInf.isFetchingNextPage) return;
    customersInf.fetchNextPage();
  };

  const customerForm = useAppForm({
    defaultValues: {
      customerId: 0 as number
    },
    onSubmit: async () => {}
  });

  const selectedCustomerId = Number(customerForm.state.values.customerId) || 0;

  const handleCustomerValueChange = async (value: string | number | "") => {
    if (value === "") {
      setDraftInvoiceId(null);
      setIsLoadingCustomer(false);
      return;
    }

    const customerId = Number(value);
    if (!Number.isFinite(customerId) || customerId < 0) {
      setDraftInvoiceId(null);
      return;
    }

    setIsLoadingCustomer(true);
    setDraftInvoiceId(null);
    try {
      const res = await createDraftInvoice(customerId);
      if (res.success && res.result?.id) {
        setDraftInvoiceId(Number(res.result.id));
      }
    } catch (error) {
      console.error("Error creating draft invoice:", error);
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const addToCart = async (item: MenuItem) => {
    if (item.type === "service") {
      // TODO: Handle services later
      console.log("Service will be handled later");
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex((cartItem) => cartItem.key === item.key);
      if (index === -1) return [...prev, { ...item, quantity: 1 }];

      const next = [...prev];
      next[index] = { ...next[index], quantity: next[index].quantity + 1 };
      return next;
    });

    setIsLoadingProduct(true);

    const invoiceIdForUpdate = draftInvoiceId ?? 0;

    upsertBoughtProduct({
      invoiceId: invoiceIdForUpdate,
      productId: item.id,
      unitId: 1,
      qty: 1,
      price: item.price,
      fee: item.price,
      customerId: selectedCustomerId || 0,
      status: 0,
      note: ""
    } as any)
      .catch((error) => {
        console.error("Error adding product to invoice:", error);
      })
      .finally(() => {
        setIsLoadingProduct(false);
      });
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleOpenModal = () => {
    setModalShown(true);
  };

  const handleCloseModal = () => {
    setModalShown(false);
  };

  const handleSubmitModal = async (values: any) => {
    if (!draftInvoiceId) {
      console.error("No draft invoice. Please select a customer first.");
      return;
    }

    try {
      // Call API to update draft invoice
      const res = await updateDraftInvoice({
        id: draftInvoiceId as any,
        amount: values.amount || totalAmount,
        discount: values.discount || 0,
        voucherCode: values.discountCode || "",
        fee: values.fee || totalAmount,
        paymentType: values.paymentMethod,
        invoiceCode: "",
        invoiceType: "",
        vatAmount: 0,
        amountCard: 0,
        paid: 0,
        debt: 0,
        status: 0,
        statusTemp: 0,
        receiptImage: "",
        receiptDate: "",
        createdTime: new Date().toISOString(),
        updatedTime: new Date().toISOString(),
        userId: 0,
        customerId: selectedCustomerId || 0,
        branchId: 0,
        customerName: "",
        userName: ""
      });

      if (res.success) {
        // Close modal and clear cart after successful update
        handleCloseModal();
        clearCart();
        setDraftInvoiceId(null);
        // TODO: Show success popup/toast
        console.log("Invoice created successfully:", res.result);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      // TODO: Show error popup/toast
    }
  };

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
          <div className="col-12 col-xxl-7">
            <div className="card border-0 shadow-sm h-100">
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

                <div className="btn-group" role="group" aria-label="Lọc loại mặt hàng">
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
                {isLoadingItems ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-loader-2 fs-1 d-block mb-2" />
                    Đang tải dữ liệu...
                  </div>
                ) : null}

                {isErrorItems ? (
                  <div className="text-center py-5 text-danger">
                    <i className="ti ti-alert-circle fs-1 d-block mb-2" />
                    Không tải được danh sách mặt hàng. Vui lòng thử lại.
                  </div>
                ) : null}

                {!isLoadingItems && !isErrorItems ? (
                  <div className="row g-3">
                    {filteredItems.map((item) => (
                      <div className="col-12 col-sm-6 col-xl-4" key={item.key}>
                        <button
                          type="button"
                          className="card border-0 shadow-sm text-start w-100 h-100 p-0 overflow-hidden sale-item-card"
                          onClick={() => void addToCart(item)}
                          disabled={isLoadingProduct || isLoadingCustomer}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center sale-item-cover"
                            style={{ backgroundColor: item.accent, height: 92 }}
                          >
                            <i
                              className={`ti ${item.type === "product" ? "ti-tools-kitchen-2" : "ti-user-star"} fs-28 text-primary`}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="p-3">
                            <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                              <h6 className="mb-0 text-truncate">{item.name}</h6>
                              <span className="badge badge-soft-primary">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <span
                                className={`badge ${
                                  item.type === "product" ? "badge-soft-info" : "badge-soft-warning"
                                }`}
                              >
                                {item.category}
                              </span>
                              <span className="text-primary small fw-medium sale-add-label">
                                Thêm vào đơn
                              </span>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {!isLoadingItems && !isErrorItems && filteredItems.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="ti ti-package-off fs-1 d-block mb-2" />
                    Không có mặt hàng phù hợp với bộ lọc hiện tại.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="col-12 col-xxl-5">
            <div className="card border-0 shadow-sm h-100">
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
                  {customersInf.isError ? (
                    <div className="small text-danger mt-1">
                      Không tải được danh sách khách hàng. Vui lòng thử lại.
                    </div>
                  ) : null}
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
                                    title="Giảm số lượng"
                                  >
                                    <i className="ti ti-minus" />
                                  </button>
                                  <span className="sale-qty-value">{item.quantity}</span>
                                  <button
                                    type="button"
                                    className="sale-qty-btn sale-qty-btn-plus"
                                    onClick={() => updateQuantity(item.key, 1)}
                                    title="Tăng số lượng"
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

      <ModalSale
        shown={modalShown}
        initialAmount={totalAmount}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
