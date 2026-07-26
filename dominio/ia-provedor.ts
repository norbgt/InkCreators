// Provedor de IA — camada única de acoplamento com o fornecedor de modelo.
//
// O código original chamava o gateway proprietário do Lovable
// (ai.gateway.lovable.dev), o que tinha dois problemas: dependência de
// infraestrutura de terceiro no caminho crítico do produto, e custo por
// orçamento invisível — passava pela fatura do Lovable, sem discriminação.
//
// Aqui o provedor fica isolado num único arquivo. Trocar de fornecedor
// significa mexer só neste ponto; os prompts e os schemas de saída, que
// são o ativo de verdade, seguem intactos.
//
// Os modelos em uso no código original eram Gemini Flash, disponíveis
// direto no Google AI Studio — a migração é trocar a chave.

import { createGoogleGenerativeAI } from "@ai-sdk/google";

/** Modelo de visão para análise de imagem. Usado em orçamento e portfólio. */
export const MODELO_VISAO = "gemini-2.5-flash";

export function criarProvedorIA() {
  const chave = process.env.GOOGLE_AI_API_KEY;
  if (!chave) {
    throw new Error(
      "GOOGLE_AI_API_KEY ausente. Defina a variável de ambiente no servidor — " +
        "nunca com prefixo VITE_, que exporia a chave ao navegador.",
    );
  }
  return createGoogleGenerativeAI({ apiKey: chave });
}

export function modeloVisao() {
  return criarProvedorIA()(MODELO_VISAO);
}

// ── Nota de custo ────────────────────────────────────────────────────
// Cada análise de orçamento envia até 8 imagens ao modelo. Esse é o
// principal custo variável do produto e hoje não está medido. Antes de
// desenhar qualquer plano de assinatura, instrumentar aqui: registrar
// tokens de entrada e saída por chamada permite calcular o custo real
// por orçamento — número que falta para o modelo de negócio fechar.
