# 003 — Protótipo primeiro

**Data:** 26 de julho de 2026
**Situação:** acordo de trabalho, em vigor

## A regra

Todo ajuste é feito primeiro no protótipo. O backend só se move quando houver indicação explícita de necessidade — e essa indicação é responsabilidade da Claude apontar, não da Amanda adivinhar.

## Por quê

O protótipo custa pouco para mudar e mostra a decisão antes dela virar código. Construir tabela para tela que ainda vai mudar é a forma mais cara de errar: joga fora trabalho de banco, migração e teste por causa de uma decisão de produto que levaria minutos para ajustar numa interface.

Também torna a troca mais justa. Iterar no protótipo consome uma fração do esforço de iterar no banco, e a Amanda enxerga o resultado sem precisar interpretar SQL.

## A única exceção

**Falha de segurança se corrige na hora.** Se aparecer algo como a leitura irrestrita de perfis ou a recursão infinita entre políticas — os dois defeitos encontrados em 26/07 — a Claude avisa e corrige direto no banco, sem esperar rodada de protótipo. Dado exposto não espera decisão de produto.

## Quando o backend precisa se mover

A Claude deve dizer explicitamente "agora precisamos de backend" quando:

- Uma tela desenhada e aprovada precisa de dado que não existe em tabela nenhuma
- Uma regra de negócio decidida não pode ser garantida pelo navegador — qualquer coisa que envolva autorização, dinheiro ou dado de outra pessoa
- O protótipo já fingiu algo tempo suficiente para a decisão estar madura, e manter a ficção passou a atrapalhar a avaliação

Até lá, o protótipo finge. Fingir é o trabalho dele.

## O que isso muda na prática

O modo demonstração deixa de ser um andaime e passa a ser onde o produto é desenhado. O modo real vira o termômetro: a distância entre os dois mede o que falta construir.

Cada rodada de protótipo que fecha uma decisão deve virar registro aqui em `decisoes/`, para que a construção posterior do backend saiba o que está implementando e por quê.
