// Catálogo real de estilos de tatuagem com nível de complexidade e referência de preço.
// Complexidade: 1=Simples, 2=Médio, 3=Complexo, 4=Master
// hourly_cents: faixa de hora-arte típica em centavos (BRL).

export type Complexity = 1 | 2 | 3 | 4;

export const COMPLEXITY_LABEL: Record<Complexity, string> = {
  1: "Simples",
  2: "Médio",
  3: "Complexo",
  4: "Master",
};

export type StyleInfo = {
  slug: string;
  name: string;
  complexity: Complexity;
  hourly_min_cents: number;
  hourly_max_cents: number;
  description: string;
};

// Faixas inspiradas em médias praticadas por estúdios brasileiros (R$/hora).
export const TATTOO_STYLES: StyleInfo[] = [
  { slug: "minimalista", name: "Minimalista", complexity: 1, hourly_min_cents: 15000, hourly_max_cents: 25000, description: "Traços limpos e formas reduzidas. Peças pequenas e rápidas." },
  { slug: "lettering", name: "Lettering", complexity: 1, hourly_max_cents: 28000, hourly_min_cents: 18000, description: "Tipografia, frases e caligrafia autoral." },
  { slug: "fineline", name: "Fineline", complexity: 2, hourly_min_cents: 25000, hourly_max_cents: 40000, description: "Linhas extra finas, botânica e simbolismo delicado." },
  { slug: "old-school", name: "Old School", complexity: 2, hourly_min_cents: 22000, hourly_max_cents: 38000, description: "Tradicional americana: contornos grossos, cores chapadas." },
  { slug: "tribal", name: "Tribal", complexity: 2, hourly_min_cents: 20000, hourly_max_cents: 35000, description: "Padrões pretos sólidos de inspiração ancestral." },
  { slug: "blackwork", name: "Blackwork", complexity: 3, hourly_min_cents: 30000, hourly_max_cents: 50000, description: "Áreas densas de preto e composições gráficas." },
  { slug: "geometrico", name: "Geométrico", complexity: 3, hourly_min_cents: 30000, hourly_max_cents: 50000, description: "Mandalas, simetria e geometria sagrada." },
  { slug: "pontilhismo", name: "Pontilhismo", complexity: 3, hourly_min_cents: 32000, hourly_max_cents: 52000, description: "Sombreado em pontos (dotwork) com alta paciência." },
  { slug: "neo-tradicional", name: "Neo-Tradicional", complexity: 3, hourly_min_cents: 30000, hourly_max_cents: 55000, description: "Old school repaginado com cores ricas e mais detalhe." },
  { slug: "aquarela", name: "Aquarela", complexity: 3, hourly_min_cents: 32000, hourly_max_cents: 55000, description: "Manchas e respingos de cor imitando pintura." },
  { slug: "maori", name: "Maori", complexity: 3, hourly_min_cents: 28000, hourly_max_cents: 48000, description: "Iconografia polinésia com forte simbolismo." },
  { slug: "oriental", name: "Oriental (Irezumi)", complexity: 4, hourly_min_cents: 35000, hourly_max_cents: 70000, description: "Dragões, koi, ondas — composições grandes e narrativas." },
  { slug: "realismo", name: "Realismo", complexity: 4, hourly_min_cents: 40000, hourly_max_cents: 80000, description: "Retratos e cenas com fidelidade fotográfica." },
  { slug: "surrealismo", name: "Surrealismo", complexity: 4, hourly_min_cents: 40000, hourly_max_cents: 80000, description: "Realismo com elementos oníricos e composição autoral." },
  { slug: "biomecanico", name: "Biomecânico", complexity: 4, hourly_min_cents: 40000, hourly_max_cents: 75000, description: "Engrenagens e anatomia — alto nível técnico de luz/sombra." },
];

export const STYLE_BY_SLUG: Record<string, StyleInfo> = Object.fromEntries(
  TATTOO_STYLES.map((s) => [s.slug, s]),
);

// Estima preço base de um tatuador a partir dos seus estilos (usa o de maior complexidade)
export function estimateBaseHourly(styleSlugs: string[]): { min: number; max: number; complexity: Complexity } {
  const infos = styleSlugs.map((s) => STYLE_BY_SLUG[s]).filter(Boolean);
  if (infos.length === 0) return { min: 20000, max: 35000, complexity: 1 };
  const top = infos.reduce((a, b) => (b.complexity > a.complexity ? b : a));
  return { min: top.hourly_min_cents, max: top.hourly_max_cents, complexity: top.complexity };
}
