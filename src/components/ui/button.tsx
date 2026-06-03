import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("btn", {
  variants: {
    variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      danger: "btn-danger",
      outline: "btn-outline-primary"
    },
    size: {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg"
    },
    block: {
      true: "w-100",
      false: ""
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    block: false
  }
});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function Button({ className, variant, size, block, loading, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="spinner-border spinner-border-sm me-2" role="status" />}
      {children}
    </button>
  );
}
