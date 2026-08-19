# 026 — O calendário, com três origens

19 de agosto de 2026

## O pedido

> "conectar com o google é uma opção onde ele importa informações do
> google, ele pode montar manualmente então a ideia é manter o mock de
> um calendário e ali podem surgir os agendamentos do google ou os que
> foram feitos pelo inkcreator diretamente, garanta os fluxos"

## Eu tinha invertido a hierarquia

Na rodada anterior tirei o calendário e pus o Google no centro, com o
argumento de que "quem vem já está em Próximas sessões". O argumento era
verdadeiro e a conclusão, errada: **eu transformei uma opção em eixo.**

Quem nunca conecta o Google — que vai ser a maioria no começo — ficava
com uma seção que só falava de uma conexão que ele não tem.

## O calendário é o centro, e tem três procedências

| origem | o que é | de onde vem |
|---|---|---|
| **ink** | sessão marcada aqui | cliente, valor, botão de gerar QR |
| **google** | compromisso de fora | opcional, some ao desconectar |
| **manual** | bloqueio escrito à mão | funciona sem conexão nenhuma |

Cada dia do calendário mostra pontos coloridos pelas origens que tem.
Tocar num dia abre o que há nele, com a marca de origem em cada linha.

**A cor não é decoração.** Ela é o que permite desconectar o Google sem
que a pessoa fique sem saber o que sumiu — e sem se perguntar se perdeu
algo que era dela.

## Os quatro fluxos, cada um verificado

1. **Sem Google**, a sessão daqui e o bloqueio à mão aparecem; nada de
   fora aparece.
2. **Bloquear à mão** cria o item no dia escolhido, marcado como seu.
3. **Conectar** acrescenta uma origem — a sessão daqui e o bloqueio à
   mão continuam exatamente onde estavam.
4. **Desconectar** tira o que veio de lá **e só isso**. É aqui que uma
   implementação descuidada apaga a agenda inteira.

O quarto é o que costuma quebrar, e por isso tem quatro verificações
próprias, incluindo a contagem da legenda passando a zero.

## O Google se anuncia como opcional

A etiqueta era "não conectada", que sugere falta. Virou **"opcional"**,
com a frase *"A agenda funciona sem isto."* E o bloco desceu para depois
do calendário: posto antes, ele parece pré-requisito de uma coisa que já
funciona sem ele.

## Duas sabotagens que expuseram testes fracos

**Ordem por `indexOf`.** Escrevi `iCal < iG` para provar que o
calendário vem antes. Renomeei a classe do calendário e o teste
**passou** — porque `indexOf` devolve −1 e "−1 < qualquer coisa" é
verdade. Agora ele exige que os dois existam antes de comparar.

**Origem por presença.** Escrevi *"cada dia mostra de onde vêm seus
compromissos"* procurando `class="pt ink"`. Fixei a origem de **todos**
os itens em "ink" e o teste passou: a marca continuava lá, só apontava
para a coisa errada.

Agora ele lê a marca que precede cada item e compara com o que aquele
item é. A sabotagem acusa com o valor: *"marcado como ink"*.

É o mesmo padrão da semana inteira — **medi presença, e o defeito era de
correspondência.** A diferença é que desta vez o erro estava dentro do
verificador, e só apareceu porque a sabotagem é obrigatória.

**11 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
