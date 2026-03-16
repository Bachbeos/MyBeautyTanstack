import { useEffect } from "react";

export type ModalState = { type: "add" | "edit" | "delete" | "detail" | null; item?: unknown };

export function useModalFade(
  modalType: "add" | "edit" | "delete" | "detail" | null,
  setModalShown: (v: boolean) => void
) {
  useEffect(() => {
    if (modalType) {
      requestAnimationFrame(() => setModalShown(true));
    } else {
      setModalShown(false);
    }
  }, [modalType, setModalShown]);
}

export function useCloseModal(
  setModalShown: (v: boolean) => void,
  setModal: (v: ModalState) => void
) {
  return function closeModal() {
    setModalShown(false);
    setTimeout(() => setModal({ type: null }), 300);
  };
}
