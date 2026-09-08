"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import type { Role } from "@/types";

interface SidebarProps {
  userRole?: Role;
  className?: string;
}

// Sidebar fixa (navy) com logo e navegação principal
export function Sidebar({ userRole = "ADMIN", className }: SidebarProps) {
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col bg-navy text-white",
        className
      )}
    >
      <div className="flex h-13 items-center gap-2 border-b border-navy-border px-5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary">
          <Zap className="size-4 text-white" />
        </div>
        <div className="leading-none">
          <p className="text-sm font-bold tracking-tight">BiddingTech</p>
          <p className="text-[10px] text-white/50">Fornax Engenharia</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-navy-hover text-white"
                  : "text-white/60 hover:bg-navy-hover hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
