import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

// Cabeçalho de página com título, breadcrumb e ações (botões)
export function PageHeader({ title, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-center justify-between gap-4", className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-1 flex items-center gap-1 text-xs text-text-muted">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-text-secondary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-text-primary">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
