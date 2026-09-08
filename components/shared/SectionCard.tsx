import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Wrapper padrão para seções de conteúdo (card com título opcional e borda)
export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface shadow-sm", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
            {description && (
              <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
