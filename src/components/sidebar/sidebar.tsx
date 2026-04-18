/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { usePermission } from "@/hooks/use-permission";
import SimpleBar from "simplebar-react";
import { Link, useLocation } from "@tanstack/react-router";
import "simplebar-react/dist/simplebar.min.css";
import SubMenuMotion from "./SubMenuMotion";
import logo from "@assets/img/logo.svg";
import logoSmall from "@assets/img/logo-small.svg";
import logoWhite from "@assets/img/logo-white.svg";

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

  const check = (resource?: string) => {
    if (!resource) return true;
    return localStorage.getItem(`${resource}_VIEW`) === "1";
  };

  const showApp = check("CALL_HISTORY") || check("SCHEDULE");
  const showCRM =
    check("CUSTOMER") ||
    check("OPPORTUNITY") ||
    check("CUSTOMER_SOURCE") ||
    check("BRANCH") ||
    check("VOUCHER") ||
    check("UNIT") ||
    check("CATEGORY_ITEM") ||
    check("PRODUCT") ||
    check("SERVICE") ||
    check("SALE") ||
    check("INVOICE") ||
    check("REPORT");

  const showUserMgmt = check("USER") || check("ROLE");
  const showSettings = check("RESOURCE") || check("CUSTOMER_ATTRIBUTE") || check("EMAIL_TEMPLATE") || true;

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
                    {check("CALL_HISTORY") && (
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
                    {check("SCHEDULE") && (
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
                {check("CUSTOMER") && (
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
                {check("OPPORTUNITY") && (
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
                {check("CUSTOMER_SOURCE") && (
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
                {check("BRANCH") && (
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
                {check("VOUCHER") && (
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
                {check("UNIT") && (
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
                {check("CATEGORY_ITEM") && (
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
                {check("PRODUCT") && (
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
                {check("SERVICE") && (
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
                {check("SALE") && (
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
                {check("INVOICE") && (
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
                {check("REPORT") && (
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
                {check("USER") && (
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

                {check("ROLE") && (
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
                {check("RESOURCE") && (
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

                {(check("CUSTOMER_ATTRIBUTE") || check("EMAIL_TEMPLATE")) && (
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
                      {check("CUSTOMER_ATTRIBUTE") && (
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
                      {check("EMAIL_TEMPLATE") && (
                        <li>
                          <Link
                            to="/email"
                            className={activeTab === "email" ? "active" : ""}
                            onClick={() => handleTabClick("email")}
                            style={{ background: "none" }}
                          >
                            Cài đặt email
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
