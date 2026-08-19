# 022 — O CSS estava numa classe que não existia

19 de agosto de 2026

## O pedido

> "a ideia de grade não é só dentro de um mesmo card de tatuador, mas na
> verdade se aplica à distribuição dos próprios cards entre si, no feed.
> de modo que eu não veja só um tatuador por vez, mas possa ver 2 ou
> mais visto que são apresentados em no mínimo duas colunas"

## Você estava descrevendo um defeito, não pedindo uma mudança

Todo o masonry vivia escrito em **`.feed`**. O HTML nunca usou essa
classe — o container do feed sempre se chamou **`.feedposts`**, e a
regra dele era:

```css
.feedposts{max-width:440px;margin:14px auto 0}
```

Uma coluna, 440px, centralizada. **Um tatuador por vez** — a herança
literal da interface #1, intacta o tempo todo.

CSS sem elemento de um lado, elemento sem CSS do outro. Duas metades
que nunca se encontraram, e nada no meio para reclamar.

## Três rodadas com o mesmo teste verde

Escrevi, ao longo das últimas rodadas:

- *"o feed é masonry, não grade"* — lia `.feed{...column-gap}` no CSS
- *"o feed nunca cai para uma coluna"* — lia `column-count:1` no CSS
- *"ganha coluna conforme a tela cresce"* — contava `.feed{column-count:N}`

**Os três estavam certos sobre a folha de estilo e cegos sobre a
página.** Eles liam o CSS e viam `column-count:2` lá — e viam mesmo. A
regra existia. Só não se aplicava a nada.

## A verificação que faltava mede o elo

As guardas antigas do projeto pegavam **classe usada sem CSS** — foi um
defeito recorrente aqui. Esta é a direção inversa, e ninguém a tinha
escrito:

> Toda regra que define coluna tem de pertencer a uma classe que existe
> na tela renderizada.

Ela junta o CSS e o HTML numa pergunta só, em vez de olhar cada lado
separadamente. Mais duas ao lado:

- **o container do feed carrega a regra de coluna** — mesma classe nos
  dois lados
- **nada o estreita para caber um card por vez** — procura o
  `max-width` de três dígitos que criava a coluna única

Sabotei devolvendo o defeito exato: acusou três verificações, uma delas
nomeando o órfão — *"CSS órfão: feed"*.

## O padrão que se repete

Terceira vez nesta semana:

| defeito | o que eu media | o que importava |
|---|---|---|
| o QR não cabia na linha | ele existe no HTML | ele cabe na tela |
| a grade não era vista | ela existe no feed | ela aparece cedo e se distingue |
| o feed era uma coluna | a regra existe no CSS | a regra alcança o elemento |

Os três têm a mesma forma: **medi que a peça existe, e o defeito era de
ligação** — com a tela, com a atenção, com o elemento.

Existência é a propriedade mais fácil de verificar e a menos parecida
com o que a pessoa vive.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
