import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

const variantMap = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "destructive",
  success: "default",
};

const sizeMap = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}) {
  const isSuccess = variant === "success";

  return (
    <ShadcnButton
      variant={variantMap[variant] || "default"}
      size={sizeMap[size] || "default"}
      disabled={disabled || loading}
      className={cn(
        "cursor-pointer",
        fullWidth && "w-full",
        isSuccess &&
          "bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </ShadcnButton>
  );
}
