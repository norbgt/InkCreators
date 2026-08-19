# 027 — Duas faces do mesmo registro

19 de agosto de 2026

## O pedido

> "onde tatuei do tatuador tem que amarrar melhor com a ideia de
> passaporte do cliente, são duas faces de uma mesma construção:
> cliente quer ter histórico de tatuadores, estilos, estúdios, países
> etc que tatuou — e o tatuador quer mostrar quantas tatuagens já fez,
> de quais estilos, em quais estúdios, países etc"

## O que estava errado não era a tela, era a construção

As duas existiam e diziam a mesma coisa por acidente: cada uma com seus
próprios dados, seus próprios rótulos, sua própria faixa de números.
Pareciam parentes; não eram.

**Um check-in produz UM fato:** fulana tatuou com beltrano, no estúdio
tal, na cidade tal, no estilo tal, naquela data.

| lê como | dimensão que troca de nome |
|---|---|
| **cliente** — onde eu já estive | tatuadores |
| **tatuador** — o que eu já fiz | pessoas |

É o mesmo dado com o sujeito trocado. Por isso o resumo passou a ser
**uma função só**, `resumoDaTrajetoria(itens, papel)`, e a faixa de
números **uma só**, `faixaDaTrajetoria(r, papel)`.

A linha que carrega a ideia inteira:

```js
var outro = papel==="cliente" ? t.artista : t.cliente;
```

Sabotei essa linha para ver se alguma coisa acusava. Acusa.

## As cinco dimensões, nos dois lados

**Sessões · Estilos · Estúdios · Cidades · Países** — mesmas palavras,
mesma ordem, os dois lados. O que muda é a nota embaixo, porque a mesma
sessão é *"onde você tatuou"* para quem levou a agulha e *"incluindo os
de passagem"* para quem a segurou.

**Horas sob agulha** só aparece do lado do cliente: quem contou o
relógio foi ele. Mostrar zero para o tatuador seria pior que não
mostrar, e existe um teste para essa assimetria.

## A assimetria que fica, e por quê

O cliente tem **uma linha por sessão** — são poucas, e cada uma é uma
marca no corpo dele. O tatuador tem **agregados** — sessenta e cinco
linhas seriam ruído.

É diferença de granularidade, não de natureza. As dimensões contadas
são as mesmas cinco.

## A frase que faltava

Sem alguém dizer, cada tela parece um recurso solto — e o produto perde
o que tem de mais seu. Agora os dois lados dizem, e nomeiam o outro:

> **No passaporte:** "Cada sessão aqui existe dos dois lados. A mesma
> que virou um carimbo seu entrou na trajetória de quem tatuou você."
>
> **Na trajetória:** "Isto é o passaporte, visto do outro lado. Cada
> linha aqui é a mesma sessão que aparece no passaporte de quem você
> tatuou."

## Duas repetições que eu criei e tirei

A primeira versão deixou **duas faixas de números** na tela do tatuador
— a antiga e a compartilhada. É exatamente a redundância que passei a
semana removendo, agora feita por mim. Existe um teste contando faixas.

E "sessões fora da sua casa" — o dado que mostra o quanto o ofício é
itinerante — foi salvo da faixa antiga e virou uma linha embaixo da
lista de estúdios, onde tem contexto.

## Um medidor que acusou o produto por erro dele

Meu extrator de dimensões lia `class="lbl">([^<]+)<`. Só que o ícone do
rótulo vira **SVG** no render — o primeiro caractere depois de `>` é
`<`, e a captura voltava vazia. O teste dizia *"o passaporte não conta
as cinco dimensões"* quando contava.

Terceira vez esta semana que o verificador erra e parece que o
verificado errou.

## Vazamento de estado, evitado

O bloco novo troca papel e rota para comparar as duas telas. Sem
devolvê-los, os testes seguintes falhariam pelo estado que ele deixou —
foi o que aconteceu na decisão 019. Desta vez a devolução veio junto com
o bloco.

**11 roteiros, 0 falhas. 711 frases, nenhuma perdida.**

---

## Sessões antes, e "Marcos" vira "Conquistas"

> "em passaporte, sessões vem antes de marcos; 'marcos' vira
> 'conquistas'"

**A ordem estava errada e é fácil dizer por quê.** As sessões são o que
a pessoa tem no corpo — é o que ela veio ver. As conquistas são leitura
*daquilo*. Vindo antes, elas pareciam o assunto e o corpo dela virava
nota de rodapé.

## A palavra, e o cuidado que ela exige

"Conquistas" é mais quente que "Marcos", e é a sua chamada. Mas é também
uma palavra que **puxa para placar** — e o passaporte tem uma decisão
ética inteira sustentada em não ser placar (decisão original: *acervo,
não placar*; tatuagem é permanente, e uma interface que mostra "faltam
duas para" transforma decisão irreversível em tarefa a completar).

Então a frase-guarda ficou **mais explícita, não menos**:

> *"Nenhuma conquista cobra a próxima. Elas aparecem depois do que você
> viveu, nunca antes."*

Ela vem na mesma altura do título. Sem ela, o título sozinho é
gamificação.

## A lista ética cresceu junto

Havia oito padrões proibidos no passaporte. A palavra "conquista" abre
caminhos que "marco" não abria, e dois entraram:

- **"não promete a próxima conquista"** — `próxima conquista`, `nova
  conquista`, `conquista a desbloquear`
- **"não conta quantas faltam"** — `faltam N`, `mais N para`

Sabotei escrevendo *"Sua próxima conquista está perto"* no título.
Acusou, citando o trecho encontrado.

E existe agora um teste para a ordem: se as conquistas subirem de novo,
ele diz *"as conquistas subiram e viraram o assunto da tela"*.

**11 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
