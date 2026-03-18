import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Error404 from "./_crm/_error/error404";
import ThemeSettings from "@/components/theme/theme-setting";

const RootLayout = () => (
  <>
    <ThemeProvider>
      <Outlet />
      <ThemeSettings />
      <TanStackRouterDevtools />
      <Toaster position="top-right" expand richColors={false} />
    </ThemeProvider>
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <Error404 />
});
