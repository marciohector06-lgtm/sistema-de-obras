import Link from "next/link";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "./MobileNav";
import type { Role } from "@/types";

interface HeaderProps {
  userName?: string;
  userRole?: Role;
  alertasNaoLidos?: number;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ENGENHEIRO: "Engenheiro",
  VIEWER: "Visualizador",
};

// Header superior fixo (navy) com notificações e menu do usuário
export function Header({ userName = "Usuário", userRole = "ADMIN", alertasNaoLidos = 0 }: HeaderProps) {
  const iniciais = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-13 items-center justify-between border-b border-navy-border bg-navy px-4 text-white">
      <div className="flex items-center gap-3">
        <MobileNav userRole={userRole} />
        <span className="hidden text-sm font-semibold md:inline">Fornax Engenharia</span>
      </div>

      <div className="flex items-center gap-1">
        <Link href="/alertas">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-navy-hover hover:text-white">
            <Bell className="size-4.5" />
            {alertasNaoLidos > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                {alertasNaoLidos > 9 ? "9+" : alertasNaoLidos}
              </span>
            )}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="gap-2 px-1.5 text-white hover:bg-navy-hover hover:text-white" />}
          >
            <Avatar className="size-6.5">
              <AvatarFallback className="bg-primary text-[11px] text-white">{iniciais}</AvatarFallback>
            </Avatar>
            <span className="hidden text-[13px] font-medium sm:inline">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[userRole]}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon /> Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings /> Configurações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <LogOut /> Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
