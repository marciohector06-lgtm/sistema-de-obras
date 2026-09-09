import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client: GoogleGenAI | null | undefined;

export function getGeminiClient(): GoogleGenAI | null {
  if (client !== undefined) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return client;
}

export function isGeminiConfigurado(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function gerarTextoIA(params: {
  prompt: string;
  systemInstruction?: string;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: params.prompt,
    config: params.systemInstruction
      ? { systemInstruction: params.systemInstruction }
      : undefined,
  });

  return response.text ?? null;
}

export interface MensagemChat {
  role: "user" | "model";
  texto: string;
}

export async function gerarConversaIA(params: {
  mensagens: MensagemChat[];
  systemInstruction: string;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: params.mensagens.map((m) => ({ role: m.role, parts: [{ text: m.texto }] })),
    config: { systemInstruction: params.systemInstruction },
  });

  return response.text ?? null;
}

export async function gerarJsonIA<T>(params: {
  prompt: string;
  systemInstruction?: string;
  responseSchema: Record<string, unknown>;
}): Promise<T | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction,
      responseMimeType: "application/json",
      responseSchema: params.responseSchema as never,
    },
  });

  const texto = response.text;
  if (!texto) return null;

  return JSON.parse(texto) as T;
}
