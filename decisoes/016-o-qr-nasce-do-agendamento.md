# 016 — O QR nasce do agendamento

19 de agosto de 2026

## O pedido

> "Check-in de agora fica acessível em agenda, e o tatuador pode abrir a
> agenda e gerar o qr code específico para aquele agendamento"

## Por que a agenda é o lugar certo

Check-in e agenda tratam da mesma matéria: **sessão marcada**. Estavam
em abas diferentes, e isso obrigava um percurso absurdo — o tatuador
via a sessão na agenda, saía dela, entrava no check-in, e **reencontrava
numa segunda lista a mesma sessão que acabara de ver** para então abrir
o QR.

Duas listas das mesmas sessões, em duas abas, para uma ação só.

## O que mudou

**Na agenda, cada sessão marcada tem o seu botão.** "Gerar QR" mora na
linha da sessão, e o código nasce dali — é isso que liga o QR a esta
pessoa, neste dia, neste estúdio. Um botão genérico "abrir check-in"
não liga a nada.

**A segunda lista saiu.** O check-in é a seção logo abaixo, na mesma
página; repetir as sessões ali seria a mesma lista a uma rolagem de
distância. No lugar dela, uma frase que diz onde o botão está.

**A sessão com QR aberto muda de botão.** Vira "Ver o QR ›" em vez de
"Gerar QR", porque gerar de novo trocaria o código que a pessoa já está
tentando escanear.

| aba | seções |
|---|---|
| Visão geral | painel · orçamentos recebidos · propostas enviadas · dinheiro · lançamentos · quem eu tatuei |
| **Agenda** | **o mês · check-in de agora · conexões** |
| Reputação | avaliações · desempenho · onde eu tatuei |
| Cursos e eventos | que eu criei · que eu participo |

## Um defeito que a mudança expôs

A seção de check-in estava renderizando **o mês inteiro junto**: o
bloco da agenda só desviava para "conexões", e qualquer outro valor
caía no conteúdo do calendário.

O sintoma na tela: o calendário aparecia duas vezes e existiam **dois
"Gerar QR" para a mesma sessão**. Dois botões de gerar código para uma
pessoa só é o começo de um registro errado.

A verificação de seções distintas não pegou, porque a seção de check-in
era *mês + check-in* — diferente de *mês* sozinho. Quem pegou foi um
teste escrito nesta mesma rodada, que contava quantos "Gerar QR" a
página tinha antes e depois de abrir um.

## Dois testes meus que não mediam o que prometiam

**"cada sessão da agenda gera o seu QR"** contava botões. Sabotei
fazendo todos apontarem para `abrirCheckin(0)` — todos gerando o QR da
mesma pessoa — e ele passou. Contar não serve: agora ele lê os índices
e exige que sejam `0,1,2…`, distintos e em ordem. Sabotado de novo,
acusa com a lista: *"índices: [0, 0, 0]"*.

Esse é o defeito silencioso desta tela. A interface parece certa e o QR
sai da pessoa errada — e um código certo com pessoa errada não é um
erro de tela, é um registro falso no passaporte de alguém.

**Ordem de testes.** O bloco novo deixava um check-in aberto, e as
verificações seguintes — escritas para o estado "nada aberto" — falhavam
pelo estado que ele deixou, não pelo que pretendiam medir. Agora ele
fecha o que abriu.

## O que ficou protegido

- cada botão aponta para a sua sessão, em ordem
- abrir a segunda sessão carrega a segunda pessoa
- abrir outra substitui a anterior em vez de somar — duas sessões
  abertas dariam dois códigos válidos, e o cliente poderia confirmar o
  da pessoa errada
- a sessão com QR aberto oferece ver, não gerar de novo
- agenda e check-in continuam na mesma aba

Três sabotagens, três acusações.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
