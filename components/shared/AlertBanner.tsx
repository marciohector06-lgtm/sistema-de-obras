import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertBannerVariants = cva("flex items-start gap-3 rounded-lg border p-3.5 text-sm", {
  variants: {
    variant: {
      success: "border-success/20 bg-success-bg text-success",
      warning: "border-warning/20 bg-warning-bg text-warning",
      danger: "border-danger/20 bg-danger-bg text-danger",
      info: "border-info/20 bg-info-bg text-info",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

interface AlertBannerProps extends VariantProps<typeof alertBannerVariants> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Alerta inline com ícone semântico e ação opcional
export function AlertBanner({ title, description, action, variant = "info", className }: AlertBannerProps) {
  const Icon = icons[variant ?? "info"];

  return (
    <div className={cn(alertBannerVariants({ variant }), className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
