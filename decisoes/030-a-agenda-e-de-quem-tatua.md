# 030 — A agenda é de quem tatua

19 de agosto de 2026

## O pedido

> "o cliente não visualiza a agenda do tatuador, o agendamento é uma
> decisão do tatuador e o cliente só acompanha o que está agendado para
> ele no perfil de gestão do cliente"

## Isto não é ajuste de tela

Mostrar horários livres para o cliente escolher **transforma quem tatua
em recurso a ser reservado**. É o modelo de sala de reunião aplicado a
uma pessoa que decide, uma a uma, quais trabalhos aceita e em que ordem.

Tatuagem não é slot. O tatuador olha a referência, avalia o tamanho,
pensa em quantas sessões vai levar, e só então decide quando. Uma grade
de horários vagos pula tudo isso.

## O que saiu, e de três lugares

O cliente chegava à agenda do tatuador por **três portas**:

1. o botão no cabeçalho do perfil
2. o ícone no card do feed, no hover
3. o botão pequeno no card de resultado da busca

As três saíram. O que ficou no perfil: **Pedir orçamento** (principal),
Conversar e Seguir.

## O que entrou no lugar

Uma seção no perfil de gestão do cliente: **Minhas sessões**.

O que está marcado **para ela** — data, área, estilo, quem vai tatuar,
estúdio, cidade, e se está confirmada ou aguardando. Sem horário livre,
sem escolha de data, sem nada do resto da semana de quem vai tatuar.

Duas frases carregam a regra:

> *"Quem marca a data é quem vai tatuar. Você acompanha aqui, e recebe
> aviso quando algo muda."*
>
> *"Precisa remarcar? Fale com quem vai te tatuar — a data é decisão
> dele, e mudar por aqui sem combinar quebraria o dia dele."*

A segunda existe porque **a ausência de um botão precisa ser
explicada**. Sem ela, a pessoa fica procurando um "remarcar" que não
existe e conclui que o produto está incompleto.

## O que a mudança quebrou, e que estava certo quebrar

O `prontidao-do-teste` tinha um percurso de visitante que **consultava a
agenda** como passo natural: clicar em "Ver agenda", abrir a gaveta,
conferir os dias.

Esse percurso deixou de existir. O teste virou o inverso — verifica que
**não há agenda de tatuador para o cliente folhear** — e falha se o
botão voltar.

Quando uma regra de produto muda, os testes que descreviam o
comportamento antigo não são obstáculo: são o inventário do que
precisa ser revisto. Aqui foram quatro, em três roteiros.

## Sabotagens

1. Botão de volta ao perfil → acusou.
2. A tela do cliente deixando de dizer quem decide → acusou, com o
   motivo: *"a pessoa fica esperando um botão de marcar que não
   existe"*.

**11 roteiros, 0 falhas. 702 frases, nenhuma perdida.**
