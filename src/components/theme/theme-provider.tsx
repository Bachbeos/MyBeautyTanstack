import { useEffect, useState } from "react";

type Theme = "light" | "dark";
// const DEFAULT_SIDEBAR = "gradientsidebar2";
// const DEFAULT_TOPBAR = "gradienttopbar2";
// const DEFAULT_PRIMARY_COLOR = "info";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored ?? "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-bs-theme", theme);

    // html.setAttribute("data-sidebar", DEFAULT_SIDEBAR);

    // html.setAttribute("data-topbar", DEFAULT_TOPBAR);

    // html.setAttribute("data-color", DEFAULT_PRIMARY_COLOR);

    localStorage.setItem("theme", theme);
  }, [theme]);

  return children;
}
