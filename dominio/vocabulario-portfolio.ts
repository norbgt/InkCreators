// Vocabulário controlado dos atributos de portfólio.
// Alimenta a IA (limita o output), a UI (chips) e o algoritmo (matching).

export const BODY_PARTS = [
  "braço",
  "antebraço",
  "ombro",
  "peito",
  "costas",
  "coxa",
  "panturrilha",
  "pé",
  "mão",
  "dedo",
  "pescoço",
  "cabeça",
  "costela",
  "abdômen",
  "quadril",
] as const;

export const COLOR_PALETTE = [
  "preto",
  "preto e cinza",
  "colorido",
  "aquarela",
  "vermelho",
  "azul",
  "verde",
  "pastel",
  "neon",
] as const;

export const TECHNIQUES = [
  "traço fino",
  "traço grosso",
  "pontilhismo",
  "sombreamento",
  "hachura",
  "whip shading",
  "cor sólida",
  "pintura",
] as const;

export const SIZE_BUCKETS = [
  { value: "pequeno", label: "Pequeno" },
  { value: "medio", label: "Médio" },
  { value: "grande", label: "Grande" },
  { value: "sessao_dia", label: "Sessão dia" },
] as const;

export type SizeBucket = (typeof SIZE_BUCKETS)[number]["value"];
