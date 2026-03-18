import imgDefault from "../../assets/img/default.svg";
import imgMini from "../../assets/img/mini.svg";
import imgFullWidth from "../../assets/img/full-width.svg";
import { useThemeCustomizer } from "@/hooks/use-theme-customizer";
import type { ColorType, LayoutMode, SidebarColor, TopbarColor } from "@/lib/types/theme";

export default function ThemeSettings() {
  const {
    config,
    setThemeMode,
    setLayoutSize,
    setSidebarColor,
    setTopbarColor,
    setPrimaryColor,
    resetTheme
  } = useThemeCustomizer();

  return (
    <>
      {/* Trigger Button (Floating Gear Icon) */}
      <div className="sidebar-contact">
        <div
          className="toggle-theme"
          data-bs-toggle="offcanvas"
          data-bs-target="#theme-settings-offcanvas"
        >
          <i className="ti ti-settings"></i>
        </div>
      </div>

      {/* Offcanvas Panel */}
      <div
        className="sidebar-themesettings offcanvas offcanvas-end"
        tabIndex={-1}
        id="theme-settings-offcanvas"
      >
        <div className="d-flex align-items-center gap-2 px-3 py-3 offcanvas-header border-bottom bg-primary">
          <h5 className="flex-grow-1 mb-0 text-white">Trình tùy chỉnh giao diện</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body h-100" data-simplebar>
          <div className="accordion accordion-bordered" id="theme-accordion">
            {/* 1. Color Mode */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button fw-semibold fs-16"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#modesetting"
                  aria-expanded="true"
                >
                  Chế độ màu
                </button>
              </h2>
              <div
                id="modesetting"
                className="accordion-collapse collapse show"
                data-bs-parent="#theme-accordion"
              >
                <div className="accordion-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="form-check card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-bs-theme"
                          id="layout-color-light"
                          value="light"
                          checked={config.theme === "light"}
                          onChange={() => setThemeMode("light")}
                        />
                        <label
                          className="form-check-label p-2 w-100 d-flex justify-content-center align-items-center"
                          htmlFor="layout-color-light"
                        >
                          <i className="ti ti-sun me-1"></i>Sáng
                        </label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-check card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-bs-theme"
                          id="layout-color-dark"
                          value="dark"
                          checked={config.theme === "dark"}
                          onChange={() => setThemeMode("dark")}
                        />
                        <label
                          className="form-check-label p-2 w-100 d-flex justify-content-center align-items-center"
                          htmlFor="layout-color-dark"
                        >
                          <i className="ti ti-moon me-1"></i>Tối
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Chọn Bố cục */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button fw-semibold fs-16"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#layoutsetting"
                  aria-expanded="true"
                >
                  Chọn Bố cục
                </button>
              </h2>
              <div
                id="layoutsetting"
                className="accordion-collapse collapse show"
                data-bs-parent="#theme-accordion"
              >
                <div className="accordion-body">
                  <div className="theme-content">
                    <div className="row g-3">
                      {[
                        { val: "default", label: "Default", img: imgDefault },
                        { val: "mini", label: "Mini", img: imgMini },
                        { val: "hoverview", label: "Hover View", img: imgMini },
                        { val: "hidden", label: "Hidden", img: imgFullWidth },
                        { val: "full-width", label: "Full Width", img: imgFullWidth }
                      ].map((layout) => (
                        <div className="col-4" key={layout.val}>
                          <div className="theme-layout">
                            <input
                              type="radio"
                              name="data-layout"
                              id={`${layout.val}Layout`}
                              value={layout.val}
                              checked={config.sidenav.size === layout.val}
                              onChange={() => setLayoutSize(layout.val as LayoutMode)}
                            />
                            <label htmlFor={`${layout.val}Layout`}>
                              <span className="d-block mb-2 layout-img">
                                <span className="theme-check rounded-circle">
                                  <i className="ti ti-check"></i>
                                </span>
                                <img src={layout.img} alt="img" />
                              </span>
                              <span className="layout-type">{layout.label}</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Màu Sidebar */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button fw-semibold fs-16"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#sidebarcolorsetting"
                  aria-expanded="true"
                >
                  Màu Sidebar
                </button>
              </h2>
              <div
                id="sidebarcolorsetting"
                className="accordion-collapse collapse show"
                data-bs-parent="#theme-accordion"
              >
                <div className="accordion-body">
                  <div className="theme-content">
                    <h6 className="fs-14 fw-medium mb-2">Màu trơn</h6>
                    <div className="d-flex align-items-center flex-wrap mb-1">
                      {[
                        { val: "light", bg: "" },
                        { val: "sidebar2", bg: "bg-light" },
                        { val: "sidebar3", bg: "bg-dark" },
                        { val: "sidebar4", bg: "bg-primary" },
                        { val: "sidebar5", bg: "bg-secondary" },
                        { val: "sidebar6", bg: "bg-info" },
                        { val: "sidebar7", bg: "bg-indigo" }
                      ].map((item) => (
                        <div className="theme-colorselect m-1 me-2" key={item.val}>
                          <input
                            type="radio"
                            name="data-sidebar"
                            id={`${item.val}Sidebar`}
                            value={item.val}
                            checked={config.menu.color === item.val}
                            onChange={() => setSidebarColor(item.val as SidebarColor)}
                          />
                          <label
                            htmlFor={`${item.val}Sidebar`}
                            className={`d-block rounded ${item.bg} mb-2`}
                          >
                            <span className="theme-check rounded-circle">
                              <i className="ti ti-check"></i>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>

                    <h6 className="fs-14 fw-medium mb-2">Màu Gradient</h6>
                    <div className="d-flex align-items-center flex-wrap">
                      {[
                        { val: "gradientsidebar1", bg: "bg-indigo-gradient" },
                        { val: "gradientsidebar2", bg: "bg-primary-gradient" },
                        { val: "gradientsidebar3", bg: "bg-secondary-gradient" },
                        { val: "gradientsidebar4", bg: "bg-dark-gradient" },
                        { val: "gradientsidebar5", bg: "bg-purple-gradient" },
                        { val: "gradientsidebar6", bg: "bg-orange-gradient" },
                        { val: "gradientsidebar7", bg: "bg-info-gradient" }
                      ].map((item) => (
                        <div className="theme-colorselect m-1 me-2" key={item.val}>
                          <input
                            type="radio"
                            name="data-sidebar"
                            id={`${item.val}Sidebar`}
                            value={item.val}
                            checked={config.menu.color === item.val}
                            onChange={() => setSidebarColor(item.val as SidebarColor)}
                          />
                          <label
                            htmlFor={`${item.val}Sidebar`}
                            className={`d-block rounded ${item.bg}`}
                          >
                            <span className="theme-check rounded-circle">
                              <i className="ti ti-check"></i>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Màu Thanh Trên */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button fw-semibold fs-16"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#colorsetting"
                  aria-expanded="true"
                >
                  Màu Top Bar
                </button>
              </h2>
              <div
                id="colorsetting"
                className="accordion-collapse collapse show"
                data-bs-parent="#theme-accordion"
              >
                <div className="accordion-body pb-1">
                  <div className="theme-content">
                    <h6 className="fs-14 fw-medium mb-2">Màu trơn</h6>
                    <div className="d-flex align-items-center flex-wrap topbar-background mb-1">
                      {[
                        { val: "white", bg: "white-topbar" },
                        { val: "topbar1", bg: "bg-light" },
                        { val: "topbar2", bg: "bg-dark" },
                        { val: "topbar3", bg: "bg-primary" },
                        { val: "topbar4", bg: "bg-secondary" },
                        { val: "topbar5", bg: "bg-info" },
                        { val: "topbar6", bg: "bg-indigo" }
                      ].map((item) => (
                        <div className="theme-colorselect mb-3 me-3" key={item.val}>
                          <input
                            type="radio"
                            name="data-topbar"
                            id={`${item.val}Topbar`}
                            value={item.val}
                            checked={config.topbar.color === item.val}
                            onChange={() => setTopbarColor(item.val as TopbarColor)}
                          />
                          <label htmlFor={`${item.val}Topbar`} className={item.bg}>
                            <span className="theme-check rounded-circle">
                              <i className="ti ti-check"></i>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>

                    <h6 className="fs-14 fw-medium mb-2">Màu Gradient</h6>
                    <div className="d-flex align-items-center flex-wrap topbar-background">
                      {[
                        { val: "gradienttopbar1", bg: "bg-indigo-gradient" },
                        { val: "gradienttopbar2", bg: "bg-primary-gradient" },
                        { val: "gradienttopbar3", bg: "bg-secondary-gradient" },
                        { val: "gradienttopbar4", bg: "bg-dark-gradient" },
                        { val: "gradienttopbar5", bg: "bg-purple-gradient" },
                        { val: "gradienttopbar6", bg: "bg-orange-gradient" },
                        { val: "gradienttopbar7", bg: "bg-info-gradient" }
                      ].map((item) => (
                        <div className="theme-colorselect mb-3 me-3" key={item.val}>
                          <input
                            type="radio"
                            name="data-topbar"
                            id={`${item.val}Topbar`}
                            value={item.val}
                            checked={config.topbar.color === item.val}
                            onChange={() => setTopbarColor(item.val as TopbarColor)}
                          />
                          <label htmlFor={`${item.val}Topbar`} className={item.bg}>
                            <span className="theme-check rounded-circle">
                              <i className="ti ti-check"></i>
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Màu Chủ Đạo (Primary Color) */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button fw-semibold fs-16"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#sidebarcolor"
                  aria-expanded="true"
                >
                  Màu Chủ Đạo
                </button>
              </h2>
              <div
                id="sidebarcolor"
                className="accordion-collapse collapse show"
                data-bs-parent="#theme-accordion"
              >
                <div className="accordion-body pb-2">
                  <div className="theme-content">
                    <div className="d-flex align-items-center flex-wrap">
                      {[
                        { val: "primary", class: "primary-clr" },
                        { val: "secondary", class: "secondary-clr" },
                        { val: "orange", class: "orange-clr" },
                        { val: "teal", class: "teal-clr" },
                        { val: "purple", class: "purple-clr" },
                        { val: "indigo", class: "indigo-clr" },
                        { val: "info", class: "info-clr" }
                      ].map((item) => (
                        <div className="theme-colorsset me-2 mb-2" key={item.val}>
                          <input
                            type="radio"
                            name="data-color"
                            id={`${item.val}Color`}
                            value={item.val}
                            checked={config.color.color === item.val}
                            onChange={() => setPrimaryColor(item.val as ColorType)}
                          />
                          <label htmlFor={`${item.val}Color`} className={item.class}></label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 px-3 py-2 offcanvas-header border-top">
          <button type="button" className="btn w-50 btn-light" onClick={resetTheme}>
            <i className="ti ti-restore me-1"></i>Cài lại
          </button>
          <button type="button" className="btn w-50 btn-primary">
            Áp dụng
          </button>
        </div>
      </div>
    </>
  );
}
