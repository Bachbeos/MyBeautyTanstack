/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import SimpleBar from "simplebar-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import "simplebar-react/dist/simplebar.min.css";
import SubMenuMotion from "./SubMenuMotion";
import logo from "@assets/img/logo.svg";
import logoSmall from "@assets/img/logo-small.svg";
import logoWhite from "@assets/img/logo-white.svg";
import { useViewPermission } from "@/hooks/use-permission";
import { notificationQueries } from "@/lib/tanstack/options/notification";
import { useSocketStore } from "@/lib/stores/socket";
import type { NotificationReceivedEvent } from "@/lib/socket/types";
import { useQueryClient } from "@tanstack/react-query";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<string>("");

  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    dashboard: true,
    settings_general: false,
    system_settings: false,
    application: false,
    report: false
  });

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const submenuParent: Record<string, string | undefined> = {
    "profile-settings": "settings_general",
    appointment: "application",
    "call-history": "application",
    chat: "application",
    notification: "application",
    "customer-attribute": "system_settings",
    "email-template": "system_settings",
    "email-send": "system_settings"
  };

  const pathToTabKey: Record<string, string> = {
    "/branch": "branch",
    "/resource": "resources",
    "/manager-users": "manager-users",
    "/roles-permissions": "roles-permissions",
    "/profile-settings": "profile-settings",
    "/customer": "customers",
    "/opportunity": "opportunitys",
    "/dispatch": "opportunity-dispatch",
    "/customer-source": "customerSource",
    "/invoice": "invoice",
    "/voucher": "voucher",
    "/unit": "unit",
    "/category": "category",
    "/product": "product",
    "/service": "service",
    "/call-history": "call-history",
    "/appointment": "appointment",
    "/customer-attribute": "customer-attribute",
    "/email/template": "email-template",
    "/email/send": "email-send",
    "/chat": "chat",
    "/notification": "notification",
    "/sale": "sale",
    "/draft-invoice": "draft-invoice",
    "/report": "report"
  };

  const location = useLocation();
  const queryClient = useQueryClient();
  const unreadCountQ = useQuery(notificationQueries.unreadCount());
  const unreadCount = unreadCountQ.data?.result ?? 0;

  useEffect(() => {
    const socket = useSocketStore.getState().getSocket();
    if (!socket) return;

    const handleNotificationReceived = (payload: NotificationReceivedEvent) => {
      if (payload.type === "unread_count" && typeof payload.unreadCount === "number") {
        queryClient.setQueryData(["notification", "unreadCount"], {
          result: payload.unreadCount,
          status: 200,
          success: true,
          message: "OK"
        } as any);
      }
    };

    socket.on("notification_received", handleNotificationReceived);
    return () => {
      socket.off("notification_received", handleNotificationReceived);
    };
  }, [queryClient]);

  useEffect(() => {
    const currentTab = pathToTabKey[location.pathname];
    if (currentTab) {
      setActiveTab(currentTab);
      const parent = submenuParent[currentTab];
      if (parent) {
        setOpenSubmenus((prev) => ({ ...prev, [parent]: true }));
      }
    }
  }, [location.pathname]);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    const parent = submenuParent[tabKey];
    if (parent) {
      setOpenSubmenus((prev) => ({ ...prev, [parent]: true }));
    }
  };

  useEffect(() => {
    const handleHover = () => {
      if (document.body.classList.contains("mini-sidebar")) {
        document.body.classList.add("expand-menu");
      }
    };

    const handleMouseLeave = () => {
      document.body.classList.remove("expand-menu");
    };

    const sidebar = document.querySelector(".sidebar");

    sidebar?.addEventListener("mouseenter", handleHover);
    sidebar?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sidebar?.removeEventListener("mouseenter", handleHover);
      sidebar?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleToggle = () => {
    document.body.classList.toggle("mini-sidebar");
  };

  const { canViewAny, canView } = useViewPermission();

  const showApp = canViewAny(["CALL_HISTORY", "SCHEDULE"]);

  const showCRM = canViewAny([
    "CUSTOMER",
    "OPPORTUNITY",
    "CUSTOMER_SOURCE",
    "BRANCH",
    "VOUCHER",
    "UNIT",
    "CATEGORY_ITEM",
    "PRODUCT",
    "SERVICE",
    "SALE",
    "INVOICE",
    "REPORT"
  ]);

  const showUserMgmt = canViewAny(["USER", "ROLE"]);

  const showSettings = canViewAny(["RESOURCE", "CUSTOMER_ATTRIBUTE", "EMAIL_TEMPLATE"]) || true;

  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div>
          {" "}
          <Link to="/resource" className="logo logo-normal">
            {" "}
            <img src={logo} alt="Logo" />{" "}
          </Link>{" "}
          <Link to="/resource" className="logo-small">
            {" "}
            <img src={logoSmall} alt="Logo" />{" "}
          </Link>{" "}
          <Link to="/resource" className="dark-logo">
            {" "}
            <img src={logoWhite} alt="Logo" />{" "}
          </Link>{" "}
        </div>
        <button
          className="sidenav-toggle-btn btn border-0 p-0 active"
          id="toggle_btn"
          onClick={handleToggle}
        >
          <i className="ti ti-arrow-bar-to-left"></i>
        </button>
      </div>

      <SimpleBar className="sidebar-inner">
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            <li className="menu-title" style={{ display: showApp ? "block" : "none" }}>
              <span>Menu chính</span>
            </li>
            <li style={{ display: showApp ? "block" : "none" }}>
              <ul>
                <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.application ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("application");
                    }}
                  >
                    <i className="ti ti-brand-airtable"></i>
                    <span>Ứng dụng</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <SubMenuMotion open={openSubmenus.application}>
                    {canView("CALL_HISTORY") && (
                      <li>
                        <Link
                          to="/call-history"
                          className={activeTab === "call-history" ? "active" : ""}
                          onClick={() => handleTabClick("call-history")}
                        >
                          Lịch sử cuộc gọi
                        </Link>
                      </li>
                    )}
                    {canView("SCHEDULE") && (
                      <li>
                        <Link
                          to="/appointment"
                          className={activeTab === "appointment" ? "active" : ""}
                          onClick={() => handleTabClick("appointment")}
                        >
                          Lịch hẹn
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to="/chat"
                        className={activeTab === "chat" ? "active" : ""}
                        onClick={() => handleTabClick("chat")}
                      >
                        Chat
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/notification"
                        className={activeTab === "notification" ? "active" : ""}
                        onClick={() => handleTabClick("notification")}
                      >
                        Thông báo
                        {unreadCount > 0 && <span className="badge bg-danger ms-2">{unreadCount}</span>}
                      </Link>
                    </li>
                  </SubMenuMotion>
                </li>
              </ul>
            </li>
            {/* ================= CRM ================= */}
            <li className="menu-title" style={{ display: showCRM ? "block" : "none" }}>
              <span>CRM</span>
            </li>
            <li style={{ display: showCRM ? "block" : "none" }}>
              <ul>
                {canView("CUSTOMER") && (
                  <li>
                    <Link
                      to="/customer"
                      className={activeTab === "customers" ? "active" : ""}
                      onClick={() => handleTabClick("customers")}
                    >
                      <i className="ti ti-user-up"></i>
                      <span>Khách hàng</span>
                    </Link>
                  </li>
                )}
                {canView("OPPORTUNITY") && (
                  <>
                    <li>
                      <Link
                        to="/opportunity"
                        className={activeTab === "opportunitys" ? "active" : ""}
                        onClick={() => handleTabClick("opportunitys")}
                      >
                        <i className="ti ti-checkup-list"></i>
                        <span>Cơ hội</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dispatch"
                        className={activeTab === "opportunity-dispatch" ? "active" : ""}
                        onClick={() => handleTabClick("opportunity-dispatch")}
                      >
                        <i className="ti ti-medal"></i>
                        <span>Điều phối cơ hội</span>
                      </Link>
                    </li>
                  </>
                )}
                {canView("CUSTOMER_SOURCE") && (
                  <li>
                    <Link
                      to="/customer-source"
                      className={activeTab === "customerSource" ? "active" : ""}
                      onClick={() => handleTabClick("customerSource")}
                    >
                      <i className="ti ti-chart-arcs"></i>
                      <span>Nguồn khách hàng</span>
                    </Link>
                  </li>
                )}
                {canView("BRANCH") && (
                  <li>
                    <Link
                      to="/branch"
                      className={activeTab === "branch" ? "active" : ""}
                      onClick={() => handleTabClick("branch")}
                    >
                      <i className="ti ti-building-community"></i>
                      <span>Chi nhánh</span>
                    </Link>
                  </li>
                )}
                {canView("VOUCHER") && (
                  <li>
                    <Link
                      to="/voucher"
                      className={activeTab === "voucher" ? "active" : ""}
                      onClick={() => handleTabClick("voucher")}
                    >
                      <i className="ti ti-medal"></i>
                      <span>Mã giảm giá</span>
                    </Link>
                  </li>
                )}
                {canView("UNIT") && (
                  <li>
                    <Link
                      to="/unit"
                      className={activeTab === "unit" ? "active" : ""}
                      onClick={() => handleTabClick("unit")}
                    >
                      <i className="ti ti-bounce-right"></i>
                      <span>Đơn vị</span>
                    </Link>
                  </li>
                )}
                {canView("CATEGORY_ITEM") && (
                  <li>
                    <Link
                      to="/category"
                      className={activeTab === "category" ? "active" : ""}
                      onClick={() => handleTabClick("category")}
                    >
                      <i className="ti ti-brand-campaignmonitor"></i>
                      <span>Danh mục</span>
                    </Link>
                  </li>
                )}
                {canView("PRODUCT") && (
                  <li>
                    <Link
                      to="/product"
                      className={activeTab === "product" ? "active" : ""}
                      onClick={() => handleTabClick("product")}
                    >
                      <i className="ti ti-package"></i>
                      <span>Sản phẩm</span>
                    </Link>
                  </li>
                )}
                {canView("SERVICE") && (
                  <li>
                    <Link
                      to="/service"
                      className={activeTab === "service" ? "active" : ""}
                      onClick={() => handleTabClick("service")}
                    >
                      <i className="ti ti-briefcase"></i>
                      <span>Dịch vụ</span>
                    </Link>
                  </li>
                )}
                {canView("SALE") && (
                  <li>
                    <Link
                      to="/sale"
                      search={{ invoiceId: undefined }}
                      className={activeTab === "sale" ? "active" : ""}
                      onClick={() => handleTabClick("sale")}
                    >
                      <i className="ti ti-report-money"></i>
                      <span>Bán hàng</span>
                    </Link>
                  </li>
                )}
                {canView("INVOICE") && (
                  <>
                    <li>
                      <Link
                        to="/invoice"
                        className={activeTab === "invoice" ? "active" : ""}
                        onClick={() => handleTabClick("invoice")}
                      >
                        <i className="ti ti-file-invoice"></i>
                        <span>Hóa đơn</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/draft-invoice"
                        className={activeTab === "draft-invoice" ? "active" : ""}
                        onClick={() => handleTabClick("draft-invoice")}
                      >
                        <i className="ti ti-file-invoice"></i>
                        <span>Hóa đơn nháp</span>
                      </Link>
                    </li>
                  </>
                )}
                {canView("REPORT") && (
                  <li>
                    <Link
                      to="/report"
                      className={activeTab === "report" ? "active" : ""}
                      onClick={() => handleTabClick("report")}
                    >
                      <i className="ti ti-report-analytics"></i>
                      <span>Báo cáo & Thống kê</span>
                    </Link>
                  </li>
                )}
              </ul>
            </li>

            {/* ================= USER MANAGEMENT ================= */}
            <li className="menu-title" style={{ display: showUserMgmt ? "block" : "none" }}>
              <span>Quản lý người dùng</span>
            </li>
            <li style={{ display: showUserMgmt ? "block" : "none" }}>
              <ul>
                {canView("USER") && (
                  <li>
                    <Link
                      to="/user"
                      className={activeTab === "manager-users" ? "active" : ""}
                      onClick={() => handleTabClick("manager-users")}
                    >
                      <i className="ti ti-users"></i>
                      <span>Tài khoản người dùng</span>
                    </Link>
                  </li>
                )}

                {canView("ROLE") && (
                  <li>
                    <Link
                      to="/role"
                      className={activeTab === "roles-permissions" ? "active" : ""}
                      onClick={() => handleTabClick("roles-permissions")}
                    >
                      <i className="ti ti-user-shield"></i>
                      <span>Chức vụ & Phân quyền</span>
                    </Link>
                  </li>
                )}
              </ul>
            </li>

            {/* ================= SETTINGS ================= */}
            <li className="menu-title" style={{ display: showSettings ? "block" : "none" }}>
              <span>Cài đặt</span>
            </li>
            <li style={{ display: showSettings ? "block" : "none" }}>
              <ul>
                {canView("RESOURCE") && (
                  <li>
                    <Link
                      to="/resource"
                      className={activeTab === "resources" ? "active" : ""}
                      onClick={() => handleTabClick("resources")}
                    >
                      <i className="ti ti-artboard"></i>
                      <span>Tài nguyên</span>
                    </Link>
                  </li>
                )}
                {canView("EMAIL_TEMPLATE") && (
                  <>
                    <li>
                      <Link
                        to="/send"
                        className={activeTab === "email" ? "active" : ""}
                        onClick={() => handleTabClick("email")}
                        style={{ background: "none" }}
                      >
                        <i className="ti ti-file-report"></i>
                        <span>Gửi email</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/template"
                        className={activeTab === "template" ? "active" : ""}
                        onClick={() => handleTabClick("template")}
                        style={{ background: "none" }}
                      >
                        <i className="ti ti-steam"></i>
                        <span>Quản lý template</span>
                      </Link>
                    </li>
                  </>
                )}
                <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.settings_general ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("settings_general");
                    }}
                  >
                    <i className="ti ti-settings-cog"></i>
                    <span>Cài đặt chung</span>
                    <span className="menu-arrow"></span>
                  </a>

                  <SubMenuMotion open={openSubmenus.settings_general}>
                    <li>
                      <Link
                        to="/profile-settings"
                        className={activeTab === "profile-settings" ? "active" : ""}
                        onClick={() => handleTabClick("profile-settings")}
                      >
                        Hồ sơ cá nhân
                      </Link>
                    </li>
                  </SubMenuMotion>
                </li>

                {canView("CUSTOMER_ATTRIBUTE") && (
                  <li className="submenu">
                    <a
                      href="#"
                      className={openSubmenus.system_settings ? "active subdrop" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmenuToggle("system_settings");
                      }}
                    >
                      <i className="ti ti-device-laptop"></i>
                      <span>Cài đặt hệ thống</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <SubMenuMotion open={openSubmenus.system_settings}>
                      {canView("CUSTOMER_ATTRIBUTE") && (
                        <li>
                          <Link
                            to="/customer-attribute"
                            className={activeTab === "customer-attribute" ? "active" : ""}
                            onClick={() => handleTabClick("customer-attribute")}
                            style={{ background: "none" }}
                          >
                            Cài đặt khách hàng
                          </Link>
                        </li>
                      )}
                    </SubMenuMotion>
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </SimpleBar>
    </div>
  );
}
