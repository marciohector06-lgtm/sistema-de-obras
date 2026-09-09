"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Resultado {
  id: string;
  nome: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [obras, setObras] = useState<Resultado[]>([]);
  const [clientes, setClientes] = useState<Resultado[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setObras([]);
      setClientes([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const [resObras, resClientes] = await Promise.all([
        fetch(`/api/obras?q=${encodeURIComponent(query)}`),
        fetch(`/api/clientes?q=${encodeURIComponent(query)}`),
      ]);
      setObras(resObras.ok ? await resObras.json() : []);
      setClientes(resClientes.ok ? await resClientes.json() : []);
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  function irPara(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <Button
        variant="ghost"
        aria-label="Buscar"
        className="gap-1.5 text-white/70 hover:bg-navy-hover hover:text-white"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden text-xs sm:inline">Buscar</span>
        <kbd className="hidden rounded border border-white/20 px-1 text-[10px] sm:inline">⌘K</kbd>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setQuery("");
        }}
      >
      <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="sr-only">Busca</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="size-4 text-text-muted" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar obras, clientes..."
              className="border-none px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() && (
            <p className="px-2 py-6 text-center text-xs text-text-muted">
              Digite para buscar em Obras e Clientes
            </p>
          )}

          {query.trim() && obras.length === 0 && clientes.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-text-muted">Nenhum resultado encontrado</p>
          )}

          {obras.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs font-medium text-text-muted">Obras</p>
              {obras.map((obra) => (
                <button
                  key={obra.id}
                  onClick={() => irPara(`/obras/${obra.id}`)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <Building2 className="size-4 text-text-muted" />
                  {obra.nome}
                </button>
              ))}
            </div>
          )}

          {clientes.length > 0 && (
            <div>
              <p className="px-2 py-1 text-xs font-medium text-text-muted">Clientes</p>
              {clientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => irPara(`/obras?clienteId=${cliente.id}`)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <Users className="size-4 text-text-muted" />
                  {cliente.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
