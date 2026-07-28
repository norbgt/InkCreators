# Como abrir o protótipo

Três aplicativos na pasta. Dois cliques em cada um, e **nenhuma janela
de Terminal aparece**.

| | O que faz |
|---|---|
| **Abrir Ink Creators** | Sobe o servidor e abre no navegador |
| **Verificar Ink Creators** | Abre com o painel de verificação por cima |
| **Parar Ink Creators** | Encerra o servidor |

Clicar duas vezes seguidas em Abrir não sobe dois servidores: ele
reaproveita o que já está de pé e só abre a aba.

Da primeira vez, o macOS pode perguntar se você confia no aplicativo —
é porque ele foi criado aqui e não veio de uma loja. **Abrir** resolve.
Se ele não deixar, clique com o botão direito → Abrir.

---

## Por que as janelas de Terminal se acumulavam

Os arquivos `.command` continuam funcionando e fazem exatamente a mesma
coisa. O problema nunca foi o que eles fazem, e sim o que sobra depois:
uma janela de Terminal.

Eu tentava fechá-la sozinho, mas quem fecha é um comando que **pede ao
Terminal para se fechar** — e o macOS exige permissão para um programa
controlar outro. Se essa permissão nunca foi concedida, ou foi negada
uma vez, o pedido falha em silêncio e a janela fica. A cada clique,
mais uma.

Os aplicativos não dependem disso porque **nunca abrem janela nenhuma**.
O Finder executa o programa direto, e o retorno vem por notificação.

Se preferir continuar com os `.command`, a permissão fica em
Ajustes → Privacidade e Segurança → Automação → Terminal.

---

## Onde a lógica mora

Em `bin/prototipo.sh`, com três ações: `abrir`, `verificar`, `parar`.
Os aplicativos e os `.command` são só portas de entrada para o mesmo
arquivo — antes a lógica estava duplicada, e era isso que fazia um
funcionar e o outro não depois de cada ajuste.

O servidor responde `no-store` em tudo e o endereço leva um carimbo de
tempo, então você nunca vê a versão anterior.

---

## E para enviar ao ar

**`ENVIAR-E-TESTAR.command`** continua sendo `.command` de propósito:
ele imprime o andamento do envio e os três links no fim, e essa janela
você quer ler. Ela fecha quando você apertar Enter.
