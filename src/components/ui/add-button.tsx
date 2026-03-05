type Props = {
  label?: string;
  onClick?: () => void;
  className?: string;
};

export default function AddButton({ label = "Add New", onClick, className }: Props) {
  return (
    <div className={className}>
      <button type="button" className="btn btn-primary" onClick={() => onClick?.()}>
        <i className="ti ti-square-rounded-plus-filled me-1"></i>
        {label}
      </button>
    </div>
  );
}
