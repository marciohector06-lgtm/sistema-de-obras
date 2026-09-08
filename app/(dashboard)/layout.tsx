import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// Layout compartilhado por todas as páginas autenticadas (sidebar + header)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName="Márcio Héctor" userRole="ADMIN" alertasNaoLidos={3} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
