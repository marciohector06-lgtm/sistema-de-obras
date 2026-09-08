import {
  LayoutDashboard,
  Building2,
  Wallet,
  Package,
  CreditCard,
  Users,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[]; // se omitido, visível para todos os perfis
}

// Itens de navegação da sidebar principal
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Obras", href: "/obras", icon: Building2 },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Inventário", href: "/inventario", icon: Package },
  { label: "Pagamentos", href: "/pagamentos", icon: CreditCard },
  { label: "Alertas", href: "/alertas", icon: Bell },
  { label: "Usuários", href: "/usuarios", icon: Users, roles: ["ADMIN"] },
];
