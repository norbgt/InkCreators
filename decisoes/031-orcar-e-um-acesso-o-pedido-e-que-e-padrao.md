# 031 — Orçar é um acesso; o padrão está no pedido

19 de agosto de 2026

## O pedido

> "esse solicitar orçamento pode virar um acesso como é conversar, mas
> inicia um fluxo padronizado com upload de imagem referência, tamanho,
> estilo, etc"

## A barra preta

"Pedir orçamento" era uma barra de largura inteira, preta, com o preço
encostado na borda direita — `$$ por hora` flutuando dentro de um botão.

Duas coisas estavam erradas ali. A barra dava à ação um peso que ela não
precisa carregar no cabeçalho: quem chegou ao perfil já sabe que vai
orçar, e o botão gigante não convence ninguém que ainda estava decidindo.
E o preço dentro de um botão é preço que só se lê no momento de clicar —
mas a pessoa quer saber a faixa **antes**, enquanto ainda compara.

Agora são **três acessos do mesmo peso**: Pedir orçamento, Conversar,
Seguir. Uma linha, três botões iguais.

O preço voltou para a linha de medidas, junto da nota e dos anos de
ofício: *"★ 4,8 (34 avaliações) · 4 anos de ofício · $$ por hora"*.

## A hierarquia mudou de lugar, não sumiu

Orçar continua sendo a ação que sustenta o negócio. O que mudou é onde
essa diferença aparece: não no tamanho do botão, e sim **no que cada um
abre**.

| ação | o que abre |
|---|---|
| Conversar | uma conversa em branco |
| Seguir | nada — é um clique |
| Pedir orçamento | um formulário de cinco campos fixos |

## Os cinco campos, e por que fixos

> Referência · Estilo · Tamanho · Parte do corpo · Cidade

Todo pedido leva os mesmos cinco. Não é organização: é **comparação**.

Cinco tatuadores respondendo à mesma descrição produzem cinco preços que
se comparam. Cinco respondendo a cinco textos livres produzem cinco
conversas — e a semana de perguntas antes do primeiro preço.

A tela diz isso na primeira linha, antes de qualquer campo obrigatório.
Sem essa frase, obrigatoriedade parece burocracia; com ela, parece o que
é.

## O tamanho, que morava no lugar errado

Tamanho é a variável que **mais mexe no preço**, e era a única do padrão
que vivia no texto livre — no `placeholder` de Observações, disfarçada de
"tamanho aproximado".

Ali cada pessoa escreve numa unidade própria: *médio*, *palma da mão*,
*uns três dedos*, *grande*. Nenhuma se compara com a outra, e comparar é
exatamente o que o cliente vai fazer quando as respostas chegarem.

Virou régua, em centímetros:

| | referência |
|---|---|
| até 5 cm | moeda, dedo |
| 5 a 10 cm | palma da mão |
| 10 a 20 cm | antebraço |
| 20 a 30 cm | panturrilha, costela |
| fechamento | braço, perna ou costas inteiros |

As faixas são largas de propósito. Ninguém sabe se quer 12 ou 14 cm, e
fingir essa precisão só produz número inventado.

**Fechamento fica fora da régua** porque não se mede em centímetros — se
mede em sessões.

## Referência virou obrigatória

Pelo menos uma. *"Preço sem imagem é chute, e chute vira briga depois."*

É a mudança mais discutível desta rodada: um gate a mais é gente a menos
chegando ao fim. O teste com usuários dirá se alguém trava aqui — e se
travar, o certo será oferecer uma saída, não afrouxar o padrão.

## O botão travado que diz o que falta

Botão cinza e mudo é onde a pessoa clica três vezes e desiste. Este
nomeia a primeira pendência na ordem da tela — *"Falta o tamanho"* — e
conta quantas vêm depois.

## O que o diagnóstico passou a exigir

Cinco checagens novas, e uma delas nasceu de uma sabotagem malfeita.

A primeira versão do teste de centímetros era `/até 5 cm/ && /10 a 20
cm/`. Troquei **um** rótulo por "médio" e o teste passou: os outros
quatro seguravam o regex. O teste media a régua inteira quando a falha
mora num degrau só.

Agora ele percorre `TAMANHOS` e exige que **cada** degrau traga o seu
centímetro — e acusa nomeando qual virou adjetivo.

## Sabotagens

1. Um degrau vira adjetivo → acusou: *"degrau(s) em adjetivo: 'médio'"*.
2. Fechamento entra na régua com "mais de 40 cm" → acusou.
3. O botão trava sem dizer o que falta → acusou cinco vezes, uma por
   campo.
4. Referência deixa de ser obrigatória → acusou.
5. Orçar volta a ser barra própria → acusou.
6. O preço some da linha de medidas → acusou, mostrando a linha.

## Uma correção no registro

A lista de saídas explicava a mudança da linha de medidas dizendo *"o
preço saiu daqui para o botão de orçar"*. Isso deixou de ser verdade
nesta rodada. O motivo foi reescrito — registro que envelhece sem ser
corrigido é pior que registro nenhum, porque continua sendo lido.

**11 roteiros, 0 falhas. 702 frases, nenhuma perdida.**
