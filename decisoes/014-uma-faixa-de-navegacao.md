# 014 — Uma faixa de navegação, não duas

19 de agosto de 2026

## Os três pedidos

> 1. "no ambiente do tatuador, cursos e eventos continua sendo uma aba separada"
> 2. "estou com a sensação de muitas abas/subabas no espaço de gestão,
>    melhore a arquitetura e considere outros componentes"
> 3. "entre as abas e subabas tem muito espaço vertical"

## O terceiro era aritmética

Setenta pixels de nada entre a barra de abas e o conteúdo, e nenhum
deles tinha sido decidido:

| origem | valor |
|---|---|
| respiro inferior da aba | 11px |
| `main { padding-top }` | 24px |
| `margin-top` do segmento | até 36px |
| **total** | **~71px** |

Três folgas independentes somadas por acidente, no lugar exato onde a
pessoa mais precisa ver conteúdo. Uma regra resolve: `.envhead + main`
com 14px, e a primeira seção sem margem própria.

## O segundo mudou a arquitetura

Cinco abas em cima e até quatro sub-abas embaixo davam **dezoito
lugares para clicar**, com metade do conteúdo atrás do segundo clique.

Sua escolha: **página que rola, com seções.** As sub-abas sumiram.

O argumento que decidiu: num painel de gestão, **rolar é mais barato
que esconder**. Sub-aba serve para evitar rolagem — mas quem administra
um estúdio quer comparar, e comparar exige ver duas coisas juntas, que
é exatamente o que sub-aba impede por construção.

### Como foi feito sem reescrever as telas

Os blocos de código não mudaram. Continuam escritos como se cada parte
fosse uma sub-aba. O que mudou é a montagem:

```
SECOES_DA_GESTAO  →  qual aba tem quais partes, e em que ordem
montandoSecoes    →  enquanto empilha, as barras de sub-aba se calam
paginaDeGestao()  →  renderiza cada parte e empilha os corpos
```

`corpoDaGestao()` recorta o corpo por marcador — e recorte por marcador
é frouxo por natureza. Por isso ele devolve `null` em vez de lixo, e a
página volta a ser renderizada do jeito antigo. A sabotagem 2 abaixo
prova que a queda é suave: zero seções, nenhum estouro.

### O contador não podia sumir com a barra

O selo de "2 novos" e "sem resposta" vivia na sub-aba. Era o que dizia
**onde olhar antes de olhar** — e teria evaporado junto.

Foi para o título da seção, que é ainda mais perto do que ele conta:

```
Recebidos 2   Enviados 2
Resumo · Lançamentos 11 · Quem eu tatuei 5
Avaliações 2 · Desempenho por estilo · Onde eu tatuei
```

### Uma duplicação que a página empilhada criou

O resumo do caixa tinha uma prévia de quatro lançamentos com "Ver todos
→". Aquilo existia para levar à outra sub-aba. Numa página só, a tabela
completa fica logo abaixo — e a prévia viraria a mesma lista duas
vezes, a uma rolagem de distância. Saiu, com o motivo registrado.

Quem apontou isso foi um teste escrito na rodada anterior:
*"lançamentos: não repete o resumo"*. Ele foi escrito para proteger
sub-abas e acabou pegando um defeito que só existe sem elas.

## O primeiro: cursos e eventos

Sua escolha: **aba própria.** Ele tinha virado sub-aba de Reputação, e
aparecer em convenção realmente é sinal de reputação — mas isso não
ajuda quem entra ali para criar um curso. Quem vai criar procura por
"cursos", não por "reputação".

## A barra final

| aba | seções |
|---|---|
| **Hoje** | visão geral · check-in de agora |
| **Orçamentos** | recebidos · enviados |
| **Agenda** | o mês · conexões |
| **Dinheiro** | resumo · lançamentos · quem eu tatuei |
| **Reputação** | avaliações · desempenho por estilo · onde eu tatuei |
| **Cursos e eventos** | que eu criei · que eu participo |

Seis abas, **uma faixa**, zero conteúdo escondido. O fornecedor recebeu
o mesmo tratamento nas suas três telas com sub-abas.

De dezoito lugares para clicar para seis.

## Cinco sabotagens

1. **Segunda faixa de volta** → acusou nas seis abas.
2. **Marcador de recorte quebrado** → acusou zero seções, e a página
   caiu de volta no modo antigo sem estourar.
3. **Cursos e eventos fora da barra** → acusou, listando as cinco.
4. **Folga tripla de volta** → acusou.
5. **Montagem sem devolver `S.sub`** → acusou. Sem restaurar, a aba
   visitada mudaria silenciosamente qual recorte a próxima abriria.

## Um esquecimento meu

Mudei o destino de `studio-events` no protótipo e esqueci de mudar na
tabela `MUDOU_DE_LUGAR` do diagnóstico. Ele passou a comparar a tela
antiga de eventos com a de reputação e acusou 16 frases perdidas que
estavam todas lá. A tabela de destinos é código como qualquer outro:
quando o produto muda de endereço, ela muda junto.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
