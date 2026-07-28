# Como abrir o protótipo

**Dois cliques em `Abrir prototipo.html`.** É isso.

| | O que faz |
|---|---|
| **Abrir prototipo.html** | Abre o protótipo no navegador |
| **Verificar prototipo.html** | Abre com o painel de verificação por cima |

Não existe servidor para subir, nada para parar depois, nenhuma janela
de Terminal, nenhum aplicativo e nenhuma permissão a conceder. São dois
arquivos HTML que abrem outro arquivo HTML.

Se quiser, arraste os dois para o Dock ou para a barra lateral do
Finder.

---

## O que não funciona assim, e por quê

**A conexão com o banco.** O navegador bloqueia rede quando a página vem
de um arquivo do seu computador. Isso não tem contorno local — é uma
regra de segurança do navegador, não um defeito daqui.

Na prática isso quase não pesa: o protótipo inteiro funciona com os
dados fictícios, que é o modo em que a gente ajusta as telas. Quando
você precisar ver o banco de verdade — login, cadastro, painel do teste
— use o endereço publicado:

```
https://norbgt.github.io/InkCreators/
```

Se você trocar para "banco real" com o protótipo aberto do Finder, a
tela diz exatamente isso em vez de falhar sem explicação.

---

## Por que ficou tão simples

Eu tentei três máquinas antes desta, e as três quebraram:

1. **Servidor local por `.command`** — abria uma janela de Terminal por
   clique, e elas se acumulavam.
2. **Aplicativos `.app`** — não abrem janela, mas dependem de o
   Gatekeeper deixar um programa sem assinatura rodar.
3. **`bin/prototipo.sh` com porta, processo e carimbo de tempo** — mais
   partes ainda para dar errado: porta ocupada, processo órfão,
   permissão de automação do macOS para fechar a própria janela.

Cada versão dependia de alguma coisa fora do arquivo. A regra agora é a
inversa: **abrir o protótipo não pode depender de nada além do
navegador.** Um diagnóstico (`diagnostico/como-se-abre.js`) reclama se
algum dia eu trouxer o servidor de volta.

O preço dessa simplicidade é a conexão com o banco, lá em cima. É uma
troca boa: você abre o protótipo dez vezes por dia e o banco real umas
duas por semana.

---

## E para enviar ao ar

**`ENVIAR-E-TESTAR.command`** continua sendo `.command` de propósito:
ele imprime o andamento do envio e os links no fim, e essa janela você
quer ler. Ela fecha quando você apertar Enter.
