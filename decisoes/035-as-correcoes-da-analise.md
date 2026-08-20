# 035 — As correções da análise: o que era melhor agora

19 de agosto de 2026

## O critério

Da análise completa (`ANALISE-DA-CONSTRUCAO.md`), corrigir agora o que
**fica mais caro depois** — o que toca muitos lugares e cresceria com o
produto. Deixar para depois o que precisa de decisão sua ou de backend.

## Feito agora

### 1. A tipografia voltou para os tokens (design system)

A maior dívida: 7 tokens e ~124 `font-size` em px espalhados, com
11.5, 12 e 12.5 convivendo — diferenças que ninguém decidiu. **100
valores de texto normalizados** para os tokens, mesma cirurgia do
espaçamento.

A regra que ficou tem duas metades:

- **Texto (até 16px) mora nos tokens, sem exceção.** É onde a entropia
  dói: três tamanhos quase iguais de texto corrido são ruído.
- **Display (17px+) é um conjunto fechado**, como os pontos de quebra.
  Número grande, relógio, emoji e avatar têm cada um o seu tamanho
  escolhido; o que o teste impede é o conjunto crescer em silêncio.

Dois acréscimos no caminho:

- **`--t-nano: 10px`**, para um caso só: abreviação em caixa alta em
  espaço que não estica (mês do datebox, número no pino do mapa). Era o
  que 9px fazia em 6 lugares — e abaixo de 10px ninguém lê.
- **O piso do iOS:** campo de formulário com fonte menor que 16px faz o
  Safari dar zoom no foco — a tela pula e a pessoa acha que quebrou.
  Regra nova em `pointer:coarse`, com o 16px literal de propósito: o
  valor precisa ser o número que o Safari compara.

As cores em hex no render foram **absolvidas com registro**: são o QR
(que precisa ser preto para escanear, independente de tema), as
texturas procedurais e overlays sobre foto — nada disso deve seguir o
tema.

### 2. Um componente de linha (redundância)

`.item` fazia o mesmo trabalho que `.lrow` com outros números — avatar,
texto, valor à direita — em 13 lugares. Virou **`.lrow.clicavel`**: a
linha que leva a algum lugar ganha chão de hover e estado de escolhida.
Um componente, um modificador.

E o teste que dizia *"um só componente de linha de lista"* **exigia que
os dois existissem** — protegia a duplicação que fingia combater.
Corrigido: agora exige a ausência de `.item`.

### 3. Botão de maquete nunca é mudo (arquitetura)

Onze botões existiam sem `onclick` — "Finalizar compra", "Salvar
alterações", "Exportar", "Lançar entrada"… Botão que não faz nada é
indistinguível de defeito, e no teste com gente de verdade a pessoa
clica três vezes e conclui que o produto quebrou.

Todos passam por `aindaMaquete()`: uma gaveta que diz *"ainda é
maquete — o desenho está pronto; o que falta é o backend"*. O protótipo
fica honesto sobre onde termina.

### 4. As duas pontas da mesma sessão (redundância nº 2)

`BOOK` e `minhasSessoes()` são duas listas à mão para o que no produto
real será uma tabela. O espelhamento literal **não dá para testar no
mock** — e o teste diz o porquê por escrito: BOOK é a agenda da Marina
com os clientes *dela*; minhasSessoes é o cliente demo com os
tatuadores *dele* — pessoas diferentes. O que dá para exigir agora, e é
exigido: cada sessão do cliente diz quem, quando e onde, e **as duas
pontas usam o mesmo vocabulário de estado**. O espelhamento vira teste
de verdade quando a tabela `sessions` existir.

## Deixado para depois, com nome

- **Assimetria cliente/tatuador** (Financeiro aba vs Pagamentos seção):
  precisa de decisão sua, não de código.
- **`ST_ROTA_ANTIGA`**: morre quando o backend real chegar.
- **`.card` 92 usos**: custo alto, retorno baixo agora.
- **Acessibilidade sistemática** (foco, teclado, aria): antes de
  lançar, não antes do teste.
- **Redução do conjunto de display**: congelado por teste; encolher é
  trabalho com olhos na tela.

## Sabotagens

1. Um 12px escrito à mão volta → acusou com a linha.
2. Um display de 23px nasce sem decisão → acusou.
3. O piso do iOS some → acusou.
4. `.item` renasce → acusou.
5. Sessão do cliente sem o onde → acusou.
6. Estado fora do vocabulário ("pendente") → acusou.

**11 roteiros, 0 falhas. 702 frases, nenhuma perdida.**

Próximo passo combinado: **os fluxos** — a resposta ao orçamento pelo
tatuador, depois aceite + sessão marcada.
