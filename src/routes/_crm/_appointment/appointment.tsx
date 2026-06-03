import RefreshButton from "@/components/refresh/refresh";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import { useCloseModal, useModalFade } from "@/hooks/use-modal-animation";
import { appointmentMutations, appointmentQueries } from "@/lib/tanstack/options/appointment";
import { customerQueries } from "@/lib/tanstack/options/customer";
import { userQueries } from "@/lib/tanstack/options/user";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import ModalAppointment from "@/components/features/appointment/modal";
import CollapseButton from "@/components/collapse/collapse-button";

const externalEvents = [
  { title: "Lịch thực hiện dịch vụ", class: "bg-success", type: 1 },
  { title: "Lịch tư vấn", class: "bg-warning", type: 2 },
  { title: "Họp nội bộ", class: "bg-info", type: 3 }
];

export const Route = createFileRoute("/_crm/_appointment/appointment")({
  component: RouteComponent
});

function RouteComponent() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() =>
    document.body.classList.contains("header-collapse")
  );

  const { canAdd, canEdit, canDelete, canView } = usePermission("SCHEDULE");

  const [modal, setModal] = useState<{
    type: any;
    item: any;
  }>({ type: null, item: null });
  const [modalShown, setModalShown] = useState(false);

  useModalFade(modal.type, setModalShown);
  const closeModal = useCloseModal(setModalShown, (state) => setModal(state as any));

  const query = useQuery(appointmentQueries.list({ page: 1, limit: 1000 }));
  const appointments = query.data?.result?.items ?? [];

  const customerInf = useInfiniteQuery(customerQueries.infinite({ limit: 10 }));
  const userInf = useInfiniteQuery(userQueries.infinite({ limit: 10 }));

  const customerOptions = useMemo(
    () =>
      customerInf.data?.pages
        .flatMap((p) => p.result?.items ?? [])
        .map((c) => ({ label: c.name, value: c.id })) ?? [],
    [customerInf.data]
  );

  const userOptions = useMemo(
    () =>
      userInf.data?.pages
        .flatMap((p) => p.result?.items ?? [])
        .map((u) => ({ label: u.name, value: u.id })) ?? [],
    [userInf.data]
  );

  const createMutation = useMutation(appointmentMutations.create());
  const updateMutation = useMutation(appointmentMutations.update());
  const deleteMutation = useMutation(appointmentMutations.delete());

  const events = useMemo(
    () =>
      appointments.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        start: item.startTime,
        end: item.endTime,
        className: item.type === 1 ? "bg-success" : item.type === 2 ? "bg-warning" : "bg-info",
        extendedProps: { ...item }
      })),
    [appointments]
  );

  const draggableElRef = useRef<HTMLDivElement>(null);
  const draggableInstanceRef = useRef<Draggable | null>(null);

  useEffect(() => {
    if (!draggableElRef.current) return;

    if (draggableInstanceRef.current) {
      draggableInstanceRef.current.destroy();
    }

    draggableInstanceRef.current = new Draggable(draggableElRef.current, {
      itemSelector: ".fc-event",
      eventData: (eventEl: HTMLElement) => ({
        title: eventEl.innerText,
        classNames: [eventEl.getAttribute("data-class") || ""],
        duration: "01:00",
        extendedProps: { type: Number(eventEl.getAttribute("data-type")) },
        create: true
      })
    });

    return () => {
      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.destroy();
        draggableInstanceRef.current = null;
      }
    };
  }, []);

  const toDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const addOneHour = (date: Date) => {
    const next = new Date(date);
    next.setHours(next.getHours() + 1);
    return next;
  };

  // Handlers
  const handleDateSelect = (selectInfo: any) => {
    const start = selectInfo.start as Date;
    const end = (selectInfo.end as Date | null) ?? addOneHour(start);

    setModal({
      type: "add",
      item: {
        startTime: toDateTimeLocal(start),
        endTime: toDateTimeLocal(end)
      }
    });
    selectInfo.view.calendar.unselect();
  };

  const handleDateClick = (info: any) => {
    const start = info.date as Date;
    const end = addOneHour(start);

    setModal({
      type: "add",
      item: {
        startTime: toDateTimeLocal(start),
        endTime: toDateTimeLocal(end)
      }
    });
  };

  const handleEventClick = (info: any) => {
    setModal({ type: "edit", item: info.event.extendedProps });
  };

  const handleExternalEventReceive = (info: any) => {
    const droppedEvent = info.event;
    const eventType = Number(droppedEvent.extendedProps?.type) || 1;

    setModal({
      type: "add",
      item: {
        title: droppedEvent.title,
        type: eventType,
        startTime: droppedEvent.start?.toISOString() || "",
        endTime: droppedEvent.end?.toISOString() || ""
      }
    });

    // Remove temporary calendar event; actual creation is done via modal submit.
    droppedEvent.remove();
  };

  const handleSubmit = async (values: any) => {
    const mutation = modal.type === "add" ? createMutation : updateMutation;
    await mutation.mutateAsync(values);
    closeModal();
    query.refetch();
  };

  if (canView === false) {
    return (
      <div className="page-wrapper">
        <div className="content py-5 text-center">
          <div className="mb-3">
            <i className="ti ti-lock fs-48 text-danger"></i>
          </div>
          <h4 className="fw-bold">Bạn không có quyền truy cập trang này</h4>
          <p className="text-muted">Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">
              Lịch hẹn{" "}
              <span className="badge badge-soft-primary ms-2">{new Date().getFullYear()}</span>
            </h4>
            <div className="text-muted small">Lịch hẹn / Danh sách</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <RefreshButton onRefresh={() => query.refetch()} />
            <CollapseButton
              onCollapse={() => {
                document.body.classList.toggle("header-collapse");
                setIsHeaderCollapsed(!isHeaderCollapsed);
              }}
              active={isHeaderCollapsed}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <Can I="ADD" a="SCHEDULE">
                  <button
                    className="btn btn-primary w-100 mb-4"
                    onClick={() => setModal({ type: "add", item: null })}
                  >
                    <i className="ti ti-plus me-1"></i> Tạo sự kiện mới
                  </button>
                </Can>
                <Can I="VIEW" a="SCHEDULE">
                  <h6 className="fw-medium mb-3">Kéo & Thả Sự Kiện</h6>
                  <div id="external-events" ref={draggableElRef}>
                    {externalEvents.map((item, index) => (
                      <div
                        key={index}
                        className={`fc-event external-event ${item.class} text-white mb-2 p-2 rounded cursor-pointer`}
                        data-class={item.class}
                        data-type={item.type}
                        style={{ cursor: "grab" }}
                      >
                        <i className="ti ti-circle-filled fs-10 me-2"></i>
                        {item.title}
                      </div>
                    ))}
                  </div>
                </Can>
              </div>
            </div>
          </div>

          <div className="col-lg-9 col-md-8">
            <div className="card bg-white border-0 shadow-sm">
              <div className="card-body">
                <div className="appointment-calendar">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locale={viLocale}
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay"
                    }}
                    initialView="dayGridMonth"
                    editable={canEdit}
                    selectable={canAdd}
                    droppable={canAdd}
                    events={events}
                    select={handleDateSelect}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventReceive={handleExternalEventReceive}
                    height="auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalAppointment
        type={modal.type}
        shown={modalShown}
        item={modal.item}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onRequestDelete={() => setModal((prev: any) => ({ ...prev, type: "delete" }))}
        onDelete={() =>
          deleteMutation.mutateAsync(modal.item.id).then(() => {
            closeModal();
            query.refetch();
          })
        }
        customerOptions={customerOptions}
        userOptions={userOptions}
        onLoadMoreCustomers={() => customerInf.fetchNextPage()}
        onLoadMoreUsers={() => userInf.fetchNextPage()}
      />
    </div>
  );
}
