export const LIMITE_PDF_BYTES = 10 * 1024 * 1024;
export const LIMITE_XML_NFE_BYTES = 2 * 1024 * 1024;

export interface ResultadoValidacaoArquivo {
  valido: boolean;
  erro?: string;
}

export function validarPdf(tamanhoBytes: number, contentType?: string | null): ResultadoValidacaoArquivo {
  if (contentType && contentType !== "application/pdf") {
    return { valido: false, erro: "O arquivo deve ser um PDF" };
  }
  if (tamanhoBytes > LIMITE_PDF_BYTES) {
    return { valido: false, erro: "O PDF excede o limite de 10MB" };
  }
  return { valido: true };
}

export function validarXmlNFe(tamanhoBytes: number, contentType?: string | null): ResultadoValidacaoArquivo {
  const tiposAceitos = ["text/xml", "application/xml"];
  if (contentType && !tiposAceitos.includes(contentType)) {
    return { valido: false, erro: "O anexo deve ser um XML" };
  }
  if (tamanhoBytes > LIMITE_XML_NFE_BYTES) {
    return { valido: false, erro: "O XML da NF-e excede o limite de 2MB" };
  }
  return { valido: true };
}
