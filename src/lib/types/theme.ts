export type ThemeMode = "light" | "dark";
export type LayoutMode = "default" | "mini" | "hoverview" | "hidden" | "full-width";
export type ColorType = "primary" | "secondary" | "orange" | "teal" | "purple" | "indigo" | "info";
export type SidebarColor =
  | "light"
  | "sidebar2"
  | "sidebar3"
  | "sidebar4"
  | "sidebar5"
  | "sidebar6"
  | "sidebar7"
  | "gradientsidebar1"
  | "gradientsidebar2"
  | "gradientsidebar3"
  | "gradientsidebar4"
  | "gradientsidebar5"
  | "gradientsidebar6"
  | "gradientsidebar7";
export type TopbarColor =
  | "white"
  | "topbar1"
  | "topbar2"
  | "topbar3"
  | "topbar4"
  | "topbar5"
  | "topbar6"
  | "gradienttopbar1"
  | "gradienttopbar2"
  | "gradienttopbar3"
  | "gradienttopbar4"
  | "gradienttopbar5"
  | "gradienttopbar6"
  | "gradienttopbar7";

export interface IThemeConfig {
  theme: ThemeMode;
  nav: string;
  color: { color: ColorType };
  layout: { mode: string };
  topbar: { color: TopbarColor };
  menu: { color: SidebarColor };
  sidenav: { size: LayoutMode; user: boolean };
}
