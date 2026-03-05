import { useEffect, useRef } from "react";
import { Tooltip } from "bootstrap";

type Props = {
  onRefresh?: () => void;
  className?: string;
};

export default function RefreshButton({ onRefresh, className }: Props) {
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
      className={`btn btn-icon btn-outline-light shadow ${className ?? ""}`}
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      title="Refresh"
      onClick={() => onRefresh?.()}
      type="button"
    >
      <i className="ti ti-refresh"></i>
    </button>
  );
}
