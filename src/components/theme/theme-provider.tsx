import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const DEFAULT_SIDEBAR = "gradientsidebar3";
const DEFAULT_TOPBAR = "gradienttopbar3";
// Thiết lập màu chủ đạo cho các thành phần như nút, link, checkbox...
const DEFAULT_PRIMARY_COLOR = "info";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored ?? "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);

    // 2. Màu sắc Sidebar
    // document.documentElement.setAttribute("data-sidebar", DEFAULT_SIDEBAR);

    // 3. Màu sắc Topbar
    // document.documentElement.setAttribute("data-topbar", DEFAULT_TOPBAR);

    // 4. Màu chủ đạo hệ thống
    // document.documentElement.setAttribute("data-color", DEFAULT_PRIMARY_COLOR);

    localStorage.setItem("theme", theme);
  }, [theme]);

  return children;
}
