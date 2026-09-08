"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import type { Role } from "@/types";

interface MobileNavProps {
  userRole?: Role;
}

// Navegação em Sheet (drawer) para telas menores que 768px
export function MobileNav({ userRole }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-navy-hover hover:text-white" />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-60 border-none p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <Sidebar userRole={userRole} className="w-full" />
      </SheetContent>
    </Sheet>
  );
}
