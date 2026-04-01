import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import { permissionQueries } from "@/lib/tanstack/options/permission";
import { useQuery } from "@tanstack/react-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAuthStore } from "@/lib/stores/auth";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_crm")({
  component: CRMLayout
});

function CRMLayout() {
  const data = useQuery(permissionQueries.myResources());
  const { userId } = useAuthStore();
  console.log("[CRMLayout] userId from store:", userId);

  useChatSocket(userId ?? 0, "");

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
