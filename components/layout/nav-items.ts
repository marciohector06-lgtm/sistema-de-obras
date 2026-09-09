import {
  LayoutDashboard,
  Building2,
  Wallet,
  Package,
  CreditCard,
  Users,
  Bell,
  Sparkles,
  FileText,
  HardHat,
  Settings,
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
  { label: "Propostas", href: "/propostas", icon: FileText },
  { label: "Prestadores", href: "/prestadores", icon: HardHat },
  { label: "Inventário", href: "/inventario", icon: Package },
  { label: "Pagamentos", href: "/pagamentos", icon: CreditCard },
  { label: "Alertas", href: "/alertas", icon: Bell },
  { label: "Chat IA", href: "/chat", icon: Sparkles },
  { label: "Usuários", href: "/usuarios", icon: Users, roles: ["ADMIN"] },
  { label: "Configurações", href: "/configuracoes", icon: Settings, roles: ["ADMIN"] },
];
