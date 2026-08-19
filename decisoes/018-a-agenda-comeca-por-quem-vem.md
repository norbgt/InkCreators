# 018 — A agenda começa por quem vem

19 de agosto de 2026

## O pedido

> "em agenda deixe próximas sessões primeiro, depois o calendário (deixe
> bem menor e o conector com google agendas mais próximo: viabilize essa
> conexão). retire o checkin de agora, ele já é acessível em próximas
> sessões"

## A ordem estava invertida

**Ninguém abre a agenda para olhar um mês em branco.** Abre para saber
quem vem, e para abrir o QR de quem está chegando.

O calendário responde "como está a semana" — pergunta de segunda ordem.
Por isso ele desceu e encolheu: célula de 44px, largura máxima de 330px,
e a palavra "sessão" dentro de cada dia virou um ponto. Aquela palavra
se repetia cinco vezes na grade dizendo o que a cor já dizia.

| | antes | depois |
|---|---|---|
| primeiro | calendário grande | **Próximas sessões** |
| depois | próximas sessões | calendário pequeno + Google |
| terceira seção | check-in de agora | — |
| quarta | conexões | — |

## O check-in deixou de ser lugar

Você tinha razão: ele já é acessível em Próximas sessões. Agora ele
**aparece dentro da lista**, embaixo dela, e só quando existe um aberto.
Não há mais seção para visitar; há um botão "Gerar QR" na linha de cada
sessão e o QR aparece ali mesmo.

A frase que explicava o porquê — *"Abra quando a pessoa sentar. Ela
escaneia, e a sessão fica registrada para os dois"* — foi para o
cabeçalho da lista. Ela vale mais que o cartão que a carregava: é a
razão do botão, e agora fica ao lado dele.

## O Google saiu do fim da fila

Estava numa seção própria, depois de tudo. Agora vive colado ao
calendário — porque **é ele que enche esse calendário** com o resto da
vida de quem tatua: consulta, aula, viagem. Longe do que alimenta, a
conexão parecia opcional.

Um diagnóstico mede a distância em caracteres entre o calendário e o
bloco do Google, e falha se ela crescer.

## "Viabilize essa conexão"

Não dá para viabilizar daqui, e a razão é dura: **OAuth do Google exige
um client secret, e client secret não pode viver no navegador.** Qualquer
pessoa abriria o código-fonte e o teria. A troca do código por token
precisa de servidor — no nosso caso, uma Edge Function do Supabase.

Além disso, os passos 1 a 5 envolvem criar conta, aceitar termos e
manusear segredo. São seus, por definição.

Escrevi tudo em **GOOGLE-AGENDA.md**, dividido em "o que é seu" e "o que
é meu", com os escopos exatos a pedir (só `calendar.events`, não
`calendar` inteiro — o escopo largo dá acesso a configurações que não
usamos e assusta na tela de permissão).

**Minha recomendação está no documento e é para não fazer agora.** Zero
tatuadores usam o produto. A promessa "minha agenda não vai ser
ignorada" já está sendo testada pela simulação. Se o teste com usuários
disser que integrar com a agenda é uma das três coisas que mais importam
para quem tatua, vira prioridade um; se não disser, é trabalho que
envelhece antes de servir.

## O que a simulação passou a fazer

Ela existia e dava um teste otimista de graça. Duas correções:

**Ela falha.** Conexão com serviço de terceiro falha — a pessoa fecha a
janela, nega o escopo, perde a rede. Existe um interruptor na tela para
provocar a recusa durante o teste, em vez de depender de sorte.

**Ela pergunta qual calendário.** Essa é a parte que dá medo de verdade:
ninguém quer sessão de tatuagem caindo no calendário da família. A
escolha entre criar um calendário separado e usar o principal é a
decisão real, e agora o protótipo a faz — com a nota de que é a única
escolha ali que não dá para desfazer sem bagunçar.

## Sabotagens

1. Lista deixando de ser seção → acusou.
2. Conexão nunca falhando → acusou duas verificações.
3. Conectar sem perguntar o calendário → acusou.
4. Calendário sem largura máxima → acusou.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**

---

## Correção: o QR abria uma parede, e abria no lugar errado

> "retire esse elemento gigante, ele é acessado a partir da seção que já
> está abaixo 'quem vem por aí'"

Duas coisas erradas, e a segunda eu não tinha visto.

**Ele nascia acima da lista.** Eu disse na decisão anterior que o
check-in apareceria "embaixo da lista que o gerou" — e não aparecia. O
bloco do check-in vem antes do bloco da agenda dentro de `vStudio()`, e
ordem no código é ordem na tela. Quem gerava o código via uma parede
surgir no topo e **perdia de vista a sessão que a tinha gerado** — o
oposto exato do que a mudança prometia.

Escrevi a intenção certa e verifiquei a coisa errada. Os testes
confirmavam que o QR aparecia; nenhum perguntava *onde*.

**Ele era um cartão de tela inteira.** Centralizado, com QR de 180px.
Numa tela de telefone isso é a página toda.

## O que ficou

`cartaoDoCheckin()` renderiza dentro do laço das sessões, logo abaixo da
linha que o gerou: recuado 55px, com traço de acento à esquerda, QR de
132px. Lê-se como desdobramento daquela sessão, não como bloco novo — o
vínculo entre a sessão e o código deixa de precisar de explicação porque
está na posição.

O botão da linha aberta virou **"Fechar o QR"**. "Ver o QR" perdeu o
sentido: ele já está à vista.

## Três guardas novas, todas sabotadas

- **onde ele abre** — sabotei devolvendo o bloco para o topo da seção:
  acusou.
- **sem cartão de tela inteira** — procura o `max-width:520px` que
  criava a parede.
- **o tamanho do QR** — 132px, não 180px. Esta eu só escrevi porque
  sabotei e nada reclamou: o tamanho é justamente o que separa "abre na
  linha" de "abre uma parede", e sem medi-lo alguém devolve 180px e a
  mudança se desfaz em silêncio.
