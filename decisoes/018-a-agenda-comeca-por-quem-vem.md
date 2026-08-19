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
