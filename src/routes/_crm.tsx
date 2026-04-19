import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import { userQueries } from "@/lib/tanstack/options/user";
import { useQuery } from "@tanstack/react-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useAuthStore } from "@/lib/stores/auth";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useEffectEvent } from "react";
import { toast } from "sonner";
import { UserId, type UserDto } from "@/lib/types/user";

export const Route = createFileRoute("/_crm")({
  component: CRMLayout
});

function CRMLayout() {
  const navigate = useNavigate();
  const { userId, accessToken, set, clear } = useAuthStore();

  const {
    data: userInfo,
    isSuccess,
    isError
  } = useQuery({
    ...userQueries.info(),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000
  });

  const onInvalidSession = useEffectEvent(() => {
    toast.error("Phiên đăng nhập không hợp lệ hoặc bạn không có quyền truy cập.");
    clear();
    navigate({ to: "/login" });
  });

  const onSetUser = useEffectEvent((u: UserDto) => {
    set({
      userId: UserId(u.id),
      name: u.name,
      avatar: u.avatar,
      email: u.email,
      phone: u.phone,
      roleId: u.roleId,
      roleName: u.roleName as string,
      isOperator: u.isOperator,
      branchName: (u.branchName as string) || ""
    });
  });

  useEffect(() => {
    if (!accessToken) return;

    if (isError) {
      onInvalidSession();
      return;
    }

    if (!isSuccess) return;

    if (!userInfo?.result) {
      onInvalidSession();
      return;
    }

    onSetUser(userInfo.result);
  }, [isError, isSuccess, userInfo, accessToken]);

  // useQuery(permissionQueries.myResources());
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
