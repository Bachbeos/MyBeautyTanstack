// src/hooks/useThemeCustomizer.ts
import { useState, useEffect } from "react";
import type {
  IThemeConfig,
  ThemeMode,
  LayoutMode,
  SidebarColor,
  TopbarColor,
  ColorType
} from "@/lib/types/theme";

const defaultConfig: IThemeConfig = {
  theme: "light",
  nav: "vertical",
  color: { color: "primary" },
  layout: { mode: "fluid" },
  topbar: { color: "white" },
  menu: { color: "light" },
  sidenav: { size: "default", user: false }
};

export const useThemeCustomizer = () => {
  const [config, setConfig] = useState<IThemeConfig>(() => {
    const savedConfig = sessionStorage.getItem("__THEME_CONFIG__");
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });

  // Effect: Sync state changes to DOM attributes (html tag)
  useEffect(() => {
    const html = document.documentElement;

    // 1. Set Theme Mode (Light/Dark)
    if (config.theme) {
      html.setAttribute("data-bs-theme", config.theme);
    }

    // 2. Set Layout/Sidebar Size
    if (config.sidenav.size) {
      html.setAttribute("data-layout", config.sidenav.size);
      // Handle mini-sidebar class on body
      if (config.sidenav.size === "mini") {
        document.body.classList.add("mini-sidebar");
      } else {
        document.body.classList.remove("mini-sidebar");
      }
    }

    // 3. Set Sidebar Color
    if (config.menu.color) {
      html.setAttribute("data-sidebar", config.menu.color);
    }

    // 4. Set Topbar Color
    if (config.topbar.color) {
      html.setAttribute("data-topbar", config.topbar.color);
    }

    // 5. Set Primary Color
    if (config.color.color) {
      html.setAttribute("data-color", config.color.color);
    }

    // Save to Session Storage
    sessionStorage.setItem("__THEME_CONFIG__", JSON.stringify(config));
  }, [config]);

  // Actions
  const setThemeMode = (mode: ThemeMode) => {
    setConfig((prev) => ({ ...prev, theme: mode }));
  };

  const setLayoutSize = (size: LayoutMode) => {
    setConfig((prev) => ({ ...prev, sidenav: { ...prev.sidenav, size } }));
  };

  const setSidebarColor = (color: SidebarColor) => {
    setConfig((prev) => ({ ...prev, menu: { ...prev.menu, color } }));
  };

  const setTopbarColor = (color: TopbarColor) => {
    setConfig((prev) => ({ ...prev, topbar: { ...prev.topbar, color } }));
  };

  const setPrimaryColor = (color: ColorType) => {
    setConfig((prev) => ({ ...prev, color: { ...prev.color, color } }));
  };

  const resetTheme = () => {
    setConfig(defaultConfig);
  };

  return {
    config,
    setThemeMode,
    setLayoutSize,
    setSidebarColor,
    setTopbarColor,
    setPrimaryColor,
    resetTheme
  };
};
