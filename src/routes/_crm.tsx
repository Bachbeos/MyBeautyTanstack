import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_crm")({
  component: CRMLayout
});

function CRMLayout() {
  return (
    <>
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
}
