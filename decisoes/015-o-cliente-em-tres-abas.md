# 015 — O cliente em três abas

19 de agosto de 2026

## O pedido

> "a visão geral pode conter as informações das abas meus orçamentos e
> pagamentos, sem perder informação mas considerando uma arquitetura
> mais enxuta"

## O resultado

| antes | depois |
|---|---|
| Visão geral | **Visão geral** — resumo · meus orçamentos · pagamentos |
| Passaporte | Passaporte |
| Meus orçamentos | Formação |
| Formação | |
| Pagamentos | |

Cinco abas viram três, com a mesma máquina de seções empilhadas que o
tatuador ganhou na decisão 014.

**Por que essas duas e não outras.** Orçamentos e pagamentos são as
duas pontas de uma coisa só — o que a pessoa pediu e o que ela pagou —
e ambas são curtas. Passaporte e Formação continuam abas porque nenhum
dos dois se lê de passagem: um é acervo de corpo, o outro é trilha de
aprendizado.

## O custo, dito em voz alta

De Passaporte e de Formação **não se lê mais a palavra "orçamentos"**.
Ela era um destino visível na barra em todas as telas do cliente; agora
é um título de seção dentro da Visão geral.

É a troca que três abas impõem. Está registrada em
`SAIRAM_DE_PROPOSITO` com o motivo escrito, e vale ficar de olho no
teste com usuários: se alguém procurar orçamentos e não achar, o
caminho é renomear a primeira aba, não desfazer a arquitetura.

## O cartão que rolava para lugar nenhum

Os cartões do painel — "Orçamentos ativos", "Propostas sem retorno" —
faziam `go('me-quotes')`. Com a aba absorvida, isso viraria um clique
que não faz nada: você já está na página.

Agora eles rolam até a seção. `irSecao(rota, chave, valor)` navega e
usa `scrollIntoView`; cada título de seção ganhou âncora. `cartaoGrande`
escolhe sozinho: se o destino é uma página empilhada, rola; se não,
navega como antes.

## Dois defeitos que só existem depois de empilhar

A montagem renderiza a página inteira uma vez por seção. Tudo que é da
**página** e não da seção sai repetido:

- três convites "Também é tatuador(a)?" empilhados no cliente
- três avisos "Perfil em estudo" no fornecedor

Consertei os dois com guardas escritas à mão, cada uma de um jeito. Aí
percebi que o terceiro caso nasceria errado, e o padrão virou uma
função só:

```js
if (naPrimeiraSecao(sub)) h += ...o preâmbulo...
```

E um roteiro novo procura, em dez páginas empilhadas, qualquer frase de
mais de 32 caracteres que apareça duas vezes. Sabotado tirando a
guarda: acusou na hora.

## Um teste meu que não podia falhar

Escrevi uma verificação para "cartão que aponta para seção inexistente"
procurando chamadas de `irSecao` com destino inválido. Ela **nunca
poderia acusar**: `cartaoGrande` só emite `irSecao` quando a seção
existe — com um valor errado ele cai no caminho antigo, `go()` mais
`S.sub`, e o clique simplesmente não faz nada visível.

Teste que procura o sintoma errado é pior que teste nenhum, porque dá
sensação de cobertura. Reescrito para procurar o sintoma verdadeiro:
cartão apontando para uma página empilhada com um valor que não é
seção. Sabotado, acusou com o destino exato.

## Três sabotagens

1. **Preâmbulo sem guarda** → acusou a frase repetida no cliente.
2. **Seções do cliente desligadas** → 18 frases perdidas.
3. **Cartão apontando para seção inexistente** → acusou, com o destino.

**10 roteiros, 0 falhas.**
