import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import { formatBRL, formatDateBR } from "@/lib/utils";
import { calcTotaisProposta, calcTotalItem, PROPOSTA_STATUS_LABELS } from "@/lib/propostas";
import type { PropostaStatus } from "@/types";

Font.register({
  family: "PT Sans",
  fonts: [
    { src: path.join(process.cwd(), "assets/fonts/PTSans-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(process.cwd(), "assets/fonts/PTSans-Bold.ttf"), fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "PT Sans", color: "#1A1A1A" },
  header: { marginBottom: 16, borderBottomWidth: 2, borderBottomColor: "#1565C0", paddingBottom: 12 },
  empresa: { fontSize: 16, fontWeight: "bold", color: "#1565C0" },
  tituloProposta: { fontSize: 12, marginTop: 4 },
  linhaInfo: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, color: "#475569" },
  secaoTitulo: { fontSize: 11, fontWeight: "bold", marginTop: 16, marginBottom: 6, backgroundColor: "#F1F5F9", padding: 4 },
  tabelaHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: "bold",
  },
  tabelaLinha: { flexDirection: "row", paddingVertical: 2 },
  colDescricao: { flex: 3 },
  colUnidade: { flex: 1, textAlign: "center" },
  colQtd: { flex: 1, textAlign: "right" },
  colPreco: { flex: 1.2, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  totais: { marginTop: 16, alignItems: "flex-end" },
  linhaTotal: { flexDirection: "row", marginTop: 2 },
  labelTotal: { width: 140, textAlign: "right", color: "#475569" },
  valorTotal: { width: 100, textAlign: "right" },
  valorTotalFinal: { width: 100, textAlign: "right", fontWeight: "bold", fontSize: 12 },
  observacao: { marginTop: 20, fontSize: 9, color: "#475569" },
});

export interface PropostaPdfData {
  numero: number;
  titulo: string;
  status: PropostaStatus;
  clienteNome: string;
  createdAt: Date;
  bdi: number;
  impostos: number;
  observacao: string | null;
  secoes: {
    titulo: string;
    itens: { descricao: string; unidade: string; quantidade: number; precoUnitario: number }[];
  }[];
}

function PropostaDocument({ proposta }: { proposta: PropostaPdfData }) {
  const todosItens = proposta.secoes.flatMap((secao) => secao.itens);
  const totais = calcTotaisProposta({ itens: todosItens, bdi: proposta.bdi, impostos: proposta.impostos });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.empresa}>Fornax Engenharia</Text>
          <Text style={styles.tituloProposta}>
            Proposta Nº {proposta.numero} - {proposta.titulo}
          </Text>
          <View style={styles.linhaInfo}>
            <Text>Cliente: {proposta.clienteNome}</Text>
            <Text>Data: {formatDateBR(proposta.createdAt)}</Text>
            <Text>Status: {PROPOSTA_STATUS_LABELS[proposta.status]}</Text>
          </View>
        </View>

        {proposta.secoes.map((secao, secaoIndex) => (
          <View key={secaoIndex}>
            <Text style={styles.secaoTitulo}>{secao.titulo}</Text>
            <View style={styles.tabelaHeader}>
              <Text style={styles.colDescricao}>Descrição</Text>
              <Text style={styles.colUnidade}>Un.</Text>
              <Text style={styles.colQtd}>Qtd.</Text>
              <Text style={styles.colPreco}>Preço Unit.</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {secao.itens.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.tabelaLinha}>
                <Text style={styles.colDescricao}>{item.descricao}</Text>
                <Text style={styles.colUnidade}>{item.unidade}</Text>
                <Text style={styles.colQtd}>{item.quantidade}</Text>
                <Text style={styles.colPreco}>{formatBRL(item.precoUnitario)}</Text>
                <Text style={styles.colTotal}>{formatBRL(calcTotalItem(item))}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.totais}>
          <View style={styles.linhaTotal}>
            <Text style={styles.labelTotal}>Subtotal</Text>
            <Text style={styles.valorTotal}>{formatBRL(totais.subtotal)}</Text>
          </View>
          <View style={styles.linhaTotal}>
            <Text style={styles.labelTotal}>BDI ({proposta.bdi}%)</Text>
            <Text style={styles.valorTotal}>{formatBRL(totais.valorBdi)}</Text>
          </View>
          <View style={styles.linhaTotal}>
            <Text style={styles.labelTotal}>Impostos ({proposta.impostos}%)</Text>
            <Text style={styles.valorTotal}>{formatBRL(totais.valorImpostos)}</Text>
          </View>
          <View style={styles.linhaTotal}>
            <Text style={styles.labelTotal}>Valor Total</Text>
            <Text style={styles.valorTotalFinal}>{formatBRL(totais.valorTotal)}</Text>
          </View>
        </View>

        {proposta.observacao && <Text style={styles.observacao}>Observações: {proposta.observacao}</Text>}
      </Page>
    </Document>
  );
}

export async function gerarPropostaPdf(proposta: PropostaPdfData): Promise<Buffer> {
  return renderToBuffer(<PropostaDocument proposta={proposta} />);
}
