import { useEffect, useRef } from "react";
import { Tooltip } from "bootstrap";

type Props = {
  onCollapse?: () => void;
  className?: string;
  active?: boolean;
};

export default function CollapseButton({ onCollapse, className, active }: Props) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (btnRef.current) {
      const tooltip = new Tooltip(btnRef.current);
      return () => tooltip.dispose();
    }
  }, []);

  return (
    <button
      ref={btnRef}
      className={`btn btn-icon btn-outline-light shadow ${active ? "active" : ""} ${className ?? ""}`}
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      title="Collapse"
      id="collapse-header"
      onClick={() => onCollapse?.()}
      type="button"
    >
      <i className="ti ti-transition-top"></i>
    </button>
  );
}
