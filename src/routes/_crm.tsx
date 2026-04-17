import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import { permissionQueries } from "@/lib/tanstack/options/permission";
import { userQueries } from "@/lib/tanstack/options/user";
import { useQuery } from "@tanstack/react-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAuthStore } from "@/lib/stores/auth";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { UserId } from "@/lib/types/user";

export const Route = createFileRoute("/_crm")({
  component: CRMLayout
});

function CRMLayout() {
  const navigate = useNavigate();
  const { userId, accessToken, set, clear } = useAuthStore();
  
  const { data: userInfo, error, isError } = useQuery({
    ...userQueries.info(),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (userInfo?.result) {
      const u = userInfo.result;
      set({
        userId: UserId(u.id),
        name: u.name,
        avatar: u.avatar,
        email: u.email,
        phone: u.phone,
        roleId: u.roleId,
        roleName: u.roleName as string
      });
    }
  }, [userInfo, set]);

  useEffect(() => {
    if (isError || (accessToken && userInfo && !userInfo.result)) {
      toast.error("Phiên đăng nhập không hợp lệ hoặc bạn không có quyền truy cập.");
      clear();
      navigate({ to: "/login" });
    }
  }, [isError, userInfo, accessToken, clear, navigate]);

  useQuery(permissionQueries.myResources());
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
