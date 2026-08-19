# 025 — A agenda de fora

19 de agosto de 2026

## O pedido

> "a seção o mês e o google está ruim, a ideia é ter uma visão menos de
> calendário e viabilizar que o usuário puxe informações da agenda do
> google, confira fluxo e UI"

## A seção respondia à pergunta errada

Ela mostrava uma grade de 28 dias sob o título "Agenda de agosto". Mas
**quem vem, e quando, já está em Próximas sessões** — com nome, área e
hora. O calendário repetia isso em forma de cor, pedindo que a pessoa
procurasse a data para depois interpretar a célula.

O que faltava ali era a outra metade: **consulta, aula, viagem** — a
vida que nenhuma agenda de plataforma vê, e que é exatamente o motivo de
existir uma conexão com o Google.

A seção deixou de ser calendário e virou a resposta a *"o que existe
fora daqui que ocupa meu tempo, e como eu trago isso"*.

## O fluxo, em ordem de dependência

**1. O estado da conexão vem primeiro.** Sem ela, nada abaixo faz
sentido. Um teste compara as posições e falha se o Google descer.

**2. O que veio de lá.** Cinco compromissos, com dia, hora e de qual
calendário vieram. Sem esta lista, "conectada" é uma etiqueta que não
prova nada — e era o que a versão anterior tinha.

**3. Puxar sob demanda.** Quem acabou de marcar algo no Google quer ver
aqui agora, sem esperar o relógio de sincronização. Botão "Puxar agora",
com a hora da última leitura ao lado.

**4. Onde ainda cabe alguém.** O que sobrou do calendário: uma faixa de
14 colunas onde a leitura é **a altura da barra**, não a cor de uma
célula que você precisa localizar. Sessões daqui e bloqueios de lá,
somados. Embaixo, um número direto: *"11 dias sem nada marcado nas
próximas duas semanas."*

## Duas decisões de produto dentro disso

**Bloquear é escolha dele, não do Google.** Aniversário da Rita não
precisa fechar a agenda; voo para Porto Alegre precisa. Cada compromisso
tem seu botão, e o padrão vem do tipo — não de uma regra que decide por
ele.

**O título nunca vaza.** Para quem tenta marcar, o horário aparece
ocupado e ponto. Ninguém precisa saber que é consulta médica. Existe um
teste para essa frase, porque é uma promessa de privacidade e promessa
de privacidade que some é a que mais custa.

## Um defeito que eu criei e a guarda pegou

Ao recortar o CSS do calendário antigo, meu corte levou junto **três
regras que ainda serviam**: `.qrjanela`, `.qrfechar` e `.ckin` — a
janela do QR inteira, que tinha nascido duas rodadas antes.

O `prontidao-do-teste.js` acusou: *"sem CSS: ckin, qrfechar, qrjanela"*.
Essa guarda existe desde o começo do projeto porque "classe usada sem
regra" já foi um defeito recorrente aqui.

É o mesmo erro da decisão 023 — lá numa reescrita de teste, aqui numa de
CSS. **Recorte por âncora leva junto o que estiver entre as âncoras**, e
o que se perde não faz barulho. Só a guarda faz.

## Sabotagens

1. Grade de mês de volta → acusou.
2. Lista do que veio de fora removida → acusou duas.
3. Título do compromisso vazando → acusou.
4. Google no fim da seção → acusou a ordem.

**11 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
