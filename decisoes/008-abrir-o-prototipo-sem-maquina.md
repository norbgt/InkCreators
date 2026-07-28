# 008 — Abrir o protótipo sem máquina nenhuma

27 de julho de 2026

## A decisão

Abrir o protótipo passa a depender **só do navegador**. Dois arquivos
HTML na pasta — `Abrir prototipo.html` e `Verificar prototipo.html` —
que abrem o protótipo direto do disco. Nada sobe, nada fica rodando,
nada precisa ser parado depois.

Saíram do projeto: `servidor-local.py`, `bin/prototipo.sh`, os três
aplicativos `.app` e os três atalhos `.command` de abrir/verificar/parar.

## Por que, depois de três tentativas

Cada versão anterior dependia de alguma coisa **fora do arquivo**, e foi
por essa coisa que cada uma quebrou:

| Versão | Dependia de | Como quebrou |
|---|---|---|
| `.command` com servidor | Terminal fechar a própria janela | O macOS exige permissão de automação; sem ela, uma janela por clique |
| Aplicativos `.app` | Gatekeeper deixar rodar código sem assinatura | Deixou de abrir |
| `bin/prototipo.sh` | Porta livre, processo vivo, `open` recarregar a aba | Porta ocupada, processo órfão, aba antiga em foco |

O padrão é o mesmo nas três: eu tratei o sintoma da anterior e
acrescentei uma peça nova. Mais peças, mais superfície para falhar. A
correção certa não era uma quarta máquina — era **remover a máquina**.

## O que se perde

**A conexão com o banco não funciona aberta do Finder.** O navegador
bloqueia rede quando a página vem de um arquivo local, e isso não tem
contorno: é regra de segurança do navegador, não configuração.

Isso torna o endereço publicado obrigatório para testar login, cadastro
e painel do teste:

```
https://norbgt.github.io/InkCreators/
```

A troca é boa porque as duas coisas têm frequências muito diferentes: o
protótipo se abre dez vezes por dia para ajustar tela, e o banco real se
testa umas duas vezes por semana. Otimizar o caso raro às custas do
frequente foi o erro das três versões anteriores.

Para não deixar isso como surpresa, a tela "conexão com o banco" detecta
que está rodando como arquivo e explica em vez de mostrar um erro seco.

## O que impede a recaída

`diagnostico/como-se-abre.js` falha se voltarem o servidor, os `.app` ou
os scripts de abrir e parar. Não é teste de comportamento: é um bilhete
para mim mesmo daqui a duas semanas, quando parecer uma boa ideia
"resolver o problema do banco local com um servidorzinho".

## Detalhe técnico

Os três arquivos vizinhos (`dados.js`, `teste.js`, `verificar.js`) agora
são escritos com `document.write` e um carimbo de tempo no nome — mas só
quando o endereço é `http`. Servido pelo GitHub Pages, o carimbo impede
o navegador de usar a cópia antiga depois de uma publicação, que era
outra origem de "não atualizou nada". Aberto como arquivo, o carimbo
sai: alguns navegadores tratam a interrogação como parte do nome e não
acham o arquivo — e ali ele não faz falta, porque a leitura é do disco.

`document.write` em vez de criar os elementos por script porque os três
precisam executar **em ordem e antes do `load`**, que é o que a
verificação espera.
