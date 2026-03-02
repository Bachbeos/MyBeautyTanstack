import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

const RootLayout = () => (
  <>
    <Outlet />
    <Toaster />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
