import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

type MenuType = "product" | "service";

type MenuItem = {
  id: number;
  name: string;
  type: MenuType;
  category: string;
  price: number;
  accent: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "Trà đào cam sả",
    type: "product",
    category: "Đồ uống",
    price: 49000,
    accent: "#e0f2fe"
  },
  {
    id: 2,
    name: "Cà phê sữa đá",
    type: "product",
    category: "Đồ uống",
    price: 32000,
    accent: "#ffedd5"
  },
  {
    id: 3,
    name: "Bò lúc lắc",
    type: "product",
    category: "Món chính",
    price: 129000,
    accent: "#fee2e2"
  },
  {
    id: 4,
    name: "Cơm gà nướng",
    type: "product",
    category: "Món chính",
    price: 89000,
    accent: "#fef3c7"
  },
  {
    id: 5,
    name: "Set trưa văn phòng",
    type: "service",
    category: "Combo",
    price: 199000,
    accent: "#dcfce7"
  },
  {
    id: 6,
    name: "Đặt bàn tiệc sinh nhật",
    type: "service",
    category: "Dịch vụ",
    price: 500000,
    accent: "#ede9fe"
  },
  {
    id: 7,
    name: "Giao hàng nhanh 2h",
    type: "service",
    category: "Dịch vụ",
    price: 25000,
    accent: "#fce7f3"
  },
  {
    id: 8,
    name: "Lẩu hải sản",
    type: "product",
    category: "Món chính",
    price: 259000,
    accent: "#cffafe"
  },
  {
    id: 9,
    name: "Bánh flan caramel",
    type: "product",
    category: "Tráng miệng",
    price: 35000,
    accent: "#fae8ff"
  },
  {
    id: 10,
    name: "Set trà chiều",
    type: "service",
    category: "Combo",
    price: 149000,
    accent: "#dbeafe"
  }
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export const Route = createFileRoute("/_crm/_sale/sale")({
  component: RouteComponent
});

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<"all" | MenuType>("all");
  const [keyword, setKeyword] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesTab = activeTab === "all" ? true : item.type === activeTab;
      const matchesKeyword =
        keyword.trim().length === 0 ||
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.category.toLowerCase().includes(keyword.toLowerCase());

      return matchesTab && matchesKeyword;
    });
  }, [activeTab, keyword]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalQuantity = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const index = prev.findIndex((cartItem) => cartItem.id === item.id);
      if (index === -1) return [...prev, { ...item, quantity: 1 }];

      const next = [...prev];
      next[index] = { ...next[index], quantity: next[index].quantity + 1 };
      return next;
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
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
                    className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("all")}
                  >
                    Tất cả
                  </button>
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
                <div className="row g-3">
                  {filteredItems.map((item) => (
                    <div className="col-12 col-sm-6 col-xl-4" key={item.id}>
                      <button
                        type="button"
                        className="card border-0 shadow-sm text-start w-100 h-100 p-0 overflow-hidden sale-item-card"
                        onClick={() => addToCart(item)}
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

                {filteredItems.length === 0 ? (
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
                            <tr key={item.id}>
                              <td className="ps-0">
                                <div className="fw-medium">{item.name}</div>
                                <div className="small text-muted">{formatPrice(item.price)}</div>
                              </td>
                              <td className="text-center sale-qty-col">
                                <div className="sale-qty-spinner">
                                  <button
                                    type="button"
                                    className="sale-qty-btn sale-qty-btn-minus"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    title="Giảm số lượng"
                                  >
                                    <i className="ti ti-minus" />
                                  </button>
                                  <span className="sale-qty-value">{item.quantity}</span>
                                  <button
                                    type="button"
                                    className="sale-qty-btn sale-qty-btn-plus"
                                    onClick={() => updateQuantity(item.id, 1)}
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
                    <button type="button" className="btn btn-primary" disabled={cart.length === 0}>
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
    </div>
  );
}
