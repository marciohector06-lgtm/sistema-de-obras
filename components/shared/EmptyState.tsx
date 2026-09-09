import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

// Estado vazio padrão (ícone + título + descrição + CTA opcional) usado nas listagens
export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <Icon className="size-8 text-text-muted" />
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="text-xs text-text-secondary">{description}</p>}
      {actionLabel && actionHref && (
        <Button render={<Link href={actionHref} />} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
