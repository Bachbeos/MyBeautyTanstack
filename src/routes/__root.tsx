import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme/theme-provider";

const RootLayout = () => (
  <>
    <ThemeProvider>
      <Outlet />
      <TanStackRouterDevtools />
      <Toaster position="top-right" expand richColors={false} />
    </ThemeProvider>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
