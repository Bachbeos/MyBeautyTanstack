import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/stores/auth";
import "./header.scss";
import "@/assets/css/notification-shared.css";

import logo from "@assets/img/logo.svg";
import logoSmall from "@assets/img/logo-small.svg";
import logoWhite from "@assets/img/logo-white.svg";
import { cn } from "@/lib/utils";
import { notificationMutations, notificationQueries } from "@/lib/tanstack/options/notification";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import type { NotificationDto } from "@/lib/types/notification";

export default function Header() {
  const navigate = useNavigate();
  const { clear, userId, name, avatar, roleName, branchName } = useAuthStore();

  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") ?? "light"
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const user = {
    name: name || "User",
    roleName: roleName || "Thành viên",
    avatar: avatar || "",
    branchName: branchName || "N/A"
  };

  const hasAvatar = !!user?.avatar?.trim();
  const avatarSrc = user?.avatar || "";
  const fallbackName = user?.name ? user.name.substring(0, 2).toUpperCase() : "US";

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.setAttribute("data-bs-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen((open) => !open);
  };

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    clear();
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    navigate({ to: "/login" });
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

  const handleMobileSidebarToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector(".main-wrapper")?.classList.toggle("slide-nav");
    document.documentElement.classList.toggle("menu-opened");
  };

  const { data: notifyPages, refetch: refetchNotifications } = useInfiniteQuery(
    notificationQueries.infinite({ size: 10 })
  );
  const allNotifications = notifyPages?.pages.flatMap((page) => page.result?.items ?? []) ?? [];
  const notifications = (
    notifyPages?.pages.flatMap((page) => page.result?.items ?? []) ?? []
  ).filter((item) => !dismissedNotifIds.includes(item.id));
  const unreadCount = allNotifications.filter((n) => n.isRead === 0).length;
  const markRead = useMutation(notificationMutations.markRead());
  const markAllRead = useMutation(notificationMutations.markAllRead());
  const deleteNotification = useMutation(notificationMutations.delete());

  const handleBellClick = () => {
    refetchNotifications();
    setNotifOpen(!notifOpen);
  };

  const handleNotifyClick = (n: NotificationDto) => {
    if (n.isRead === 0) markRead.mutate(n.id);
    if (n.refType === "APPOINTMENT") navigate({ to: "/appointment" });
    setNotifOpen(false);
  };

  const handleDismissNotification = (id: number) => {
    setDismissedNotifIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (notifRef.current && !notifRef.current.contains(target as Node)) {
        setNotifOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target as Node)) {
        setDropdownOpen(false);
      }

      if (!(target instanceof Element)) return;

      const mainWrapper = document.querySelector(".main-wrapper");
      const isMobileSidebarOpen = mainWrapper?.classList.contains("slide-nav");
      const clickedInsideSidebar = !!target.closest(".sidebar");
      const clickedMobileButton = !!target.closest("#mobile_btn");

      if (isMobileSidebarOpen && !clickedInsideSidebar && !clickedMobileButton) {
        mainWrapper?.classList.remove("slide-nav");
        document.documentElement.classList.remove("menu-opened");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

          <a
            id="mobile_btn"
            className="mobile-btn"
            href="#sidebar"
            onClick={handleMobileSidebarToggle}
          >
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
            <button className="topbar-link btn" type="button" onClick={toggle}>
              <i className={`${theme === "dark" ? "ti ti-sun" : "ti ti-moon"} fs-16`}></i>
            </button>
          </div>

          <div className="header-item dropdown mr-7" ref={notifRef}>
            <button
              className={cn("topbar-link btn dropdown-toggle drop-arrow-none", notifOpen && "show")}
              type="button"
              onClick={handleBellClick}
            >
              <i className="ti ti-bell-check fs-16 animate-ring"></i>
              <span className="badge rounded-pill">
                {unreadCount > 0 ? unreadCount : 0}
              </span>
            </button>

            <div
              className={cn(
                "dropdown-menu dropdown-menu-end dropdown-menu-lg p-0 shadow-lg border-0",
                notifOpen && "show"
              )}
              style={{ minHeight: 300, display: notifOpen ? "block" : "none" }}
            >
              <div className="p-2 border-bottom bg-white rounded-top d-flex align-items-center justify-content-between">
                <h6 className="m-0 fs-16 fw-semibold">Thông báo</h6>
                <button
                  className="btn btn-sm btn-light"
                  type="button"
                  onClick={() => userId && markAllRead.mutate(Number(userId))}
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="notification-body" style={{ maxHeight: "350px", overflowY: "auto" }}>
                {notifications.map((notif) => {
                  const notifFallbackName = notif.title
                    ? notif.title.substring(0, 2).toUpperCase()
                    : "NT";

                  const hasNotifAvatar = !!notif.image && notif.image.trim() !== "";

                  return (
                    <div
                      key={notif.id}
                      className="dropdown-item notification-item py-3 text-wrap border-bottom cursor-pointer"
                      onClick={() => handleNotifyClick(notif)}
                    >
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          {hasNotifAvatar ? (
                            <img
                              src={notif.image || ""}
                              className="avatar-md rounded-circle"
                              alt="Notification"
                            />
                          ) : (
                            <div
                              className="avatar-md rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle text-primary fw-bold fs-12"
                              style={{ width: 40, height: 40 }}
                            >
                              {notifFallbackName}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">{notif.title}</p>
                          <p className="mb-1 text-wrap fs-13">{notif.content}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12 text-muted">
                              <i className="ti ti-clock me-1"></i>
                              {new Date(notif.createdTime).toLocaleString("vi-VN")}
                            </span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              {notif.isRead === 0 && (
                                <a
                                  href="#"
                                  className="notification-read rounded-circle bg-danger"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    markRead.mutate(notif.id);
                                  }}
                                ></a>
                              )}
                              <button
                                className="btn rounded-circle p-0"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification.mutate(notif.id, {
                                    onSuccess: () => handleDismissNotification(notif.id)
                                  });
                                }}
                              >
                                <i className="ti ti-x"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2 rounded-bottom border-top text-center bg-white">
                <Link
                  to="/notification"
                  className="text-primary text-decoration-underline fs-14 mb-0"
                >
                  Xem tất cả thông báo
                </Link>
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
                  <p className="d-block fs-13 text-muted">Chức vụ: {user?.roleName}</p>
                  <p className="fw-small text-dark mb-0">Chi nhánh: {user?.branchName}</p>
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
