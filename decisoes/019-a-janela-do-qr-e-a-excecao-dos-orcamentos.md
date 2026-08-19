# 019 — A janela do QR, e a exceção dos orçamentos

19 de agosto de 2026

## Os dois pedidos

> "o qr code grande abre em pop up (outra janela) não expande a página"
>
> "orçamentos 'enviados/recebidos' são separados por toggle na aba
> orçamentos"

## O QR flutua em vez de empurrar

Numa lista de sessões, um bloco que cresce no meio **joga tudo para
baixo e a pessoa perde o lugar de onde saiu** — ainda mais no telefone,
onde a tela inteira passa a ser ocupada por algo que ela não pediu para
ver.

Agora o QR grande abre numa janela sobre a página, com fundo escuro que
fecha ao toque. A página não muda de tamanho.

## A distinção que evita perder uma sessão

**Fechar a janela não cancela o check-in.** São coisas diferentes:

- o **check-in** é um estado com relógio correndo
- a **janela** é só onde se olha para ele

Confundir os dois faria o tatuador perder a sessão inteira ao tocar fora
do QR sem querer — com o cliente já vinculado e o relógio andando.

`S.checkin.janela` é separado de `S.checkin.aberto`. `fecharJanelaQR()`
fecha a vista; `fecharCheckin()` cancela. Um teste sabota trocando um
pelo outro e acusa.

## A linha passou a falar

Sem o bloco expandido, a linha da sessão precisava dizer sozinha em que
pé está: *esperando escanear · vinculada · em andamento · encerrada*. O
botão virou "Ver o QR", que reabre a janela.

**Uma janela por página, não uma por sessão** — ela é fixa na tela e não
pertence a nenhum lugar do fluxo do documento. Verificado: com três
sessões, uma janela.

## Orçamentos volta ao alternador

É a única aba da gestão que não virou página que rola, e o motivo está
escrito no código e no teste:

> **Recebidos tem um fluxo de três passos dentro** — mapa, pedido,
> proposta. Empilhar Enviados embaixo dele faria a pessoa rolar por um
> segundo assunto no meio de uma decisão que ainda não terminou.

Alternador é o componente certo quando são **dois destinos**; seção é o
certo quando são **duas partes de um**. Aqui são destinos.

Existe um teste para a exceção — senão alguém "corrige" a inconsistência
daqui a três rodadas e devolve o fluxo de três passos para o meio de uma
rolagem. Ele verifica que o alternador existe, que a aba não virou
página empilhada, e que **Recebidos é o padrão**, porque quem chega em
Orçamentos quer ver quem está pedindo, não quem já respondeu.

## Um teste meu que dependia da ordem

A verificação do padrão lia qual aba estava ativa — e um teste anterior
no mesmo arquivo tinha deixado "enviados" escolhido. Padrão só se
observa em quem nunca escolheu. Passou a zerar a escolha antes de medir.

## Três sabotagens

1. **Janela sem sobreposição** → acusou.
2. **Fechar a janela cancelando o check-in** → acusou três verificações.
3. **Orçamentos virando página empilhada** → acusou cinco.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
