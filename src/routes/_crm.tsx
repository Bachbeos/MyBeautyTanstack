import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import { permissionQueries } from "@/lib/tanstack/options/permission";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_crm")({
  component: CRMLayout
});

function CRMLayout() {
  const data = useQuery(permissionQueries.myResources());
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
