# 034 — A tela vazia que só existia para quem já usava

19 de agosto de 2026

## O que você viu

Visão geral do tatuador: cabeçalho, as seis abas, o rodapé — e **nada no
meio**.

## Por que acontecia com você e não comigo

A Visão geral deixou de ter seções na decisão 033, e a chave `vg` morreu
junto. Mas a condição do painel continuava sendo:

```js
if (sub === "studio" && subAba("vg","visao") === "visao")
```

Você já tinha usado o produto. No seu navegador estava gravado
`vg:"dinheiro"` — a última seção que você abriu antes de Dinheiro virar
aba. A condição dava falso, nenhum outro bloco pegava a rota, e a página
saía com casca e sem miolo.

Nos meus onze roteiros isso **nunca apareceu**, e o motivo é a lição
desta rodada:

> **Todos os meus testes começam com `S.sub = {}`.**

Estado limpo é exatamente o estado que ninguém real tem. Testar sempre
do zero é testar o primeiro minuto de um produto e nunca o segundo dia.

## As duas correções

**1. O painel não depende mais de uma chave que não existe.** A condição
virou `sub === "studio"`. Uma tela sem seções não deveria consultar
nenhuma sub-aba para saber se deve se desenhar.

**2. O que ficou gravado é limpo ao carregar.** `limparSubAntigo()` faz
duas coisas, com o mesmo espírito — guardar a escolha de quem já esteve
aqui, mas nunca deixá-la mandar numa arquitetura que ela não conhece:

- **chave aposentada** (`vg`, `ck`, `hoje`): a seção inteira deixou de
  existir, a chave sai
- **valor inválido**: a chave vive, a peça escolhida não — sai também

E a escolha ainda válida **fica**. Uma limpeza que zera tudo resolve o
sintoma jogando fora o que a persistência existia para guardar.

## O guarda: estado envenenado

Um teste novo monta cada tela de gestão dos três papéis — quinze telas —
com `S.sub` cheio de lixo de propósito: chaves de arquiteturas passadas,
valores de seções que já não existem.

```js
var VENENO = {vg:"dinheiro", ck:"agora", hoje:"visao", ag:"mes",
              rep:"desempenho", fin:"pessoas", mev:"nada",
              cx:"pessoas", orc:"inexistente", ev:"sumiu"};
```

**Nenhuma pode abrir vazia.** E ele mede o miolo, não a página — o
cabeçalho de navegação sozinho passa de 2800 caracteres, e um piso sobre
a página inteira aprovaria exatamente a tela que você fotografou.

## A regra que fica

Toda vez que uma seção morre, três coisas precisam ser feitas, e eu
tinha feito uma:

1. tirar a seção do trilho ✔
2. tirar a dependência da chave dela ✘
3. aposentar a chave no estado gravado ✘

A partir de agora as três têm teste.

## Sabotagens

1. Painel volta a depender da chave morta → acusou: *"abriram só com
   casca: artist/studio (31)"*.
2. Limpeza para de aposentar chaves → acusou, listando as sobras.
3. Limpeza passa a apagar tudo → acusou: *"a limpeza levou junto a
   escolha boa de quem já usava"*.

**11 roteiros, 0 falhas.**
