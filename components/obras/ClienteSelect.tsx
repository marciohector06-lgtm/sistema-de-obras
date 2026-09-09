"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ClienteOption {
  id: string;
  nome: string;
}

interface ClienteSelectProps {
  clientes: ClienteOption[];
  value?: string;
  onChange: (clienteId: string, clientes: ClienteOption[]) => void;
}

// Select de cliente com opção de cadastro inline (via modal)
export function ClienteSelect({ clientes, value, onChange }: ClienteSelectProps) {
  const [lista, setLista] = useState(clientes);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleCriarCliente(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, telefone, cpfCnpj, endereco }),
    });

    if (!res.ok) {
      toast.error("Não foi possível cadastrar o cliente");
      setSalvando(false);
      return;
    }

    const novoCliente = await res.json();
    const novaLista = [...lista, novoCliente].sort((a, b) => a.nome.localeCompare(b.nome));
    setLista(novaLista);
    onChange(novoCliente.id, novaLista);
    setDialogAberto(false);
    setNome("");
    setEmail("");
    setTelefone("");
    setCpfCnpj("");
    setEndereco("");
    setSalvando(false);
    toast.success("Cliente cadastrado");
  }

  return (
    <>
      <Select
        value={value}
        onValueChange={(v) => {
          if (!v) return;
          if (v === "__novo__") {
            setDialogAberto(true);
            return;
          }
          onChange(v, lista);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um cliente">
            {(v: string) => (v ? lista.find((c) => c.id === v)?.nome : "Selecione um cliente")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {lista.map((cliente) => (
            <SelectItem key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="__novo__">
            <Plus className="size-3.5" /> Cadastrar novo cliente
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCriarCliente} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cliente-nome">Nome</Label>
              <Input id="cliente-nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cliente-email">E-mail</Label>
              <Input id="cliente-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cliente-telefone">Telefone</Label>
              <Input id="cliente-telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cliente-documento">CPF/CNPJ</Label>
              <Input
                id="cliente-documento"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cliente-endereco">Endereço</Label>
              <Input id="cliente-endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={salvando}>
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
