import { useCallback, useEffect, useRef, useState } from "react";

export function useCollapse(initialOpen: boolean = false) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("collapse");
    if (initialOpen) el.classList.add("show");
    else el.classList.remove("show");
    el.style.height = "";
    el.style.overflow = "";
  }, [initialOpen]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) {
      setIsOpen((s) => !s);
      return;
    }

    const currentlyOpen = el.classList.contains("show");

    const afterHide = () => {
      el.style.height = "";
      el.style.overflow = "";
      el.classList.remove("collapsing");
      el.classList.add("collapse");
    };

    const afterShow = () => {
      el.style.height = "";
      el.style.overflow = "";
      el.classList.remove("collapsing");
      el.classList.add("collapse", "show");
    };

    const onTransitionEnd = (ev: TransitionEvent) => {
      if (ev.target !== el) return;
      el.removeEventListener("transitionend", onTransitionEnd);
      if (currentlyOpen) {
        afterHide();
        setIsOpen(false);
      } else {
        afterShow();
        setIsOpen(true);
      }
    };

    if (currentlyOpen) {
      const startHeight = el.scrollHeight;
      el.style.height = startHeight + "px";
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.classList.remove("collapse", "show");
      el.classList.add("collapsing");
      el.style.overflow = "hidden";
      requestAnimationFrame(() => {
        el.style.height = "0px";
      });
      el.addEventListener("transitionend", onTransitionEnd);
      setTimeout(() => {
        if (el.classList.contains("collapsing")) {
          el.removeEventListener("transitionend", onTransitionEnd);
          afterHide();
          setIsOpen(false);
        }
      }, 500);
    } else {
      // show: animate from 0 -> scrollHeight
      el.classList.remove("collapse");
      el.style.overflow = "hidden";
      el.style.height = "0px";
      el.classList.add("collapsing");
      // force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      const target = el.scrollHeight;
      requestAnimationFrame(() => {
        el.style.height = target + "px";
      });
      el.addEventListener("transitionend", onTransitionEnd);
      setTimeout(() => {
        if (el.classList.contains("collapsing")) {
          el.removeEventListener("transitionend", onTransitionEnd);
          afterShow();
          setIsOpen(true);
        }
      }, 500);
    }
  }, []);

  const setOpen = useCallback(
    (v: boolean) => {
      if (v !== isOpen) toggle();
    },
    [isOpen, toggle]
  );

  return { ref, isOpen, toggle, setOpen };
}
