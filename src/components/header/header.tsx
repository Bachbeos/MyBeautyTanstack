import { useEffect, useRef, useState } from "react";
// Thay đổi import từ react-router-dom/redux sang TanStack và Zustand
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/stores/auth";
import "./header.scss";

// Cập nhật đường dẫn assets theo alias dự án
import logo from "@assets/img/logo.svg";
import logoSmall from "@assets/img/logo-small.svg";
import logoWhite from "@assets/img/logo-white.svg";

export default function Header() {
  const navigate = useNavigate();
  const { clear, userId } = useAuthStore();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tạm thời giữ giả lập user để không nát giao diện vì bạn muốn "có gì giữ nguyên"
  const user = { name: "Admin User", roleName: "Quản trị viên", avatar: "" };

  const hasAvatar = !!user?.avatar?.trim();
  const avatarSrc = user?.avatar || "";
  const fallbackName = user?.name ? user.name.substring(0, 2).toUpperCase() : "US";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.setAttribute("data-bs-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen((open) => !open);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clear(); // Dùng hàm clear từ auth store
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    navigate({ to: "/login" }); // Điều hướng theo chuẩn TanStack
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="navbar-header">
      <div className="page-container topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <Link to="/resource" className="logo">
            <span className="logo-light">
              <span className="logo-lg">
                <img src={logo} alt="logo" />
              </span>
              <span className="logo-sm">
                <img src={logoSmall} alt="small logo" />
              </span>
            </span>
            <span className="logo-dark">
              <span className="logo-lg">
                <img src={logoWhite} alt="dark logo" />
              </span>
            </span>
          </Link>

          <a id="mobile_btn" className="mobile-btn" href="#sidebar">
            <i className="ti ti-menu-deep fs-24"></i>
          </a>

          <button
            className="sidenav-toggle-btn btn border-0 p-0"
            id="toggle_btn2"
            onClick={() => document.body.classList.toggle("mini-sidebar")}
          >
            <i className="ti ti-arrow-bar-to-right"></i>
          </button>

          <div className="me-auto d-flex align-items-center header-search d-lg-flex d-none">
            <div className="input-icon position-relative me-2">
              <input type="text" className="form-control" placeholder="Tìm kiếm" />
              <span className="input-icon-addon d-inline-flex p-0 header-search-icon">
                <i className="ti ti-command"></i>
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <div className="header-item">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link btnFullscreen" onClick={toggleFullscreen}>
                <i className="ti ti-maximize"></i>
              </a>
            </div>
          </div>

          <div className="header-item d-none d-sm-flex me-2">
            <button className="topbar-link btn" type="button" onClick={toggleDarkMode}>
              <i className={`${darkMode ? "ti ti-sun" : "ti ti-moon"} fs-16`}></i>
            </button>
          </div>

          {/* Giữ nguyên các dropdown Page, FAQ, Report dù chưa dùng cho đẹp */}
          <div className="header-item d-none d-sm-flex">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link topbar-teal-link" data-bs-toggle="dropdown">
                <i className="ti ti-layout-grid-add"></i>
              </a>
            </div>
          </div>

          <div className="header-item d-none d-sm-flex">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link topbar-indigo-link">
                <i className="ti ti-help-hexagon"></i>
              </a>
            </div>
          </div>

          <div className="header-item d-none d-sm-flex">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link topbar-warning-link">
                <i className="ti ti-chart-pie"></i>
              </a>
            </div>
          </div>

          <div className="header-line"></div>

          <div className="header-item">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link">
                <i className="ti ti-message-circle-exclamation"></i>
                <span className="badge rounded-pill">14</span>
              </a>
            </div>
          </div>

          <div className="header-item">
            <div className="dropdown me-2">
              <button
                className="topbar-link btn dropdown-toggle drop-arrow-none"
                data-bs-toggle="dropdown"
              >
                <i className="ti ti-bell-check fs-16 animate-ring"></i>
                <span className="badge rounded-pill">10</span>
              </button>
              <div
                className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg"
                style={{ minHeight: 300 }}
              >
                <div className="p-2 border-bottom">
                  <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
                </div>
              </div>
            </div>
          </div>

          <div
            className="header-item dropdown profile-dropdown d-flex align-items-center justify-content-center"
            ref={dropdownRef}
          >
            <a
              href="#"
              className="topbar-link dropdown-toggle drop-arrow-none position-relative p-0"
              onClick={handleToggleDropdown}
            >
              {hasAvatar ? (
                <img
                  src={avatarSrc}
                  width="38"
                  height="38"
                  className="rounded-1 d-flex"
                  alt="user"
                />
              ) : (
                <div
                  className="rounded-1 d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                  style={{ width: 38, height: 38, fontSize: "16px" }}
                >
                  {fallbackName}
                </div>
              )}
              <span className="online text-success">
                <i
                  className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white"
                  style={{ fontSize: 12 }}
                ></i>
              </span>
            </a>

            <div
              className={`dropdown-menu dropdown-menu-end dropdown-menu-md p-2${dropdownOpen ? " show" : ""}`}
            >
              <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                <div className="ms-2">
                  <p className="fw-medium text-dark mb-0">{user?.name}</p>
                  <span className="d-block fs-13">{user?.roleName}</span>
                </div>
              </div>

              <Link to="/profile-settings" className="dropdown-item">
                <i className="ti ti-user-circle me-1 align-middle"></i>
                <span className="align-middle">Cài đặt hồ sơ</span>
              </Link>

              <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between dropdown-item mb-0">
                <label className="form-check-label" htmlFor="notify">
                  <i className="ti ti-bell"></i>Thông báo
                </label>
                <input
                  className="form-check-input me-0"
                  type="checkbox"
                  role="switch"
                  id="notify"
                />
              </div>

              <div className="pt-2 mt-2 border-top">
                <a href="#" onClick={handleLogout} className="dropdown-item text-danger">
                  <i className="ti ti-logout me-1 fs-17 align-middle"></i>
                  <span className="align-middle">Đăng xuất</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
