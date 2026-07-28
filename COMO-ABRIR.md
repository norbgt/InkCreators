# Como abrir o protótipo

Três aplicativos na pasta. Dois cliques em cada um, e **nenhuma janela
de Terminal aparece**.

| | O que faz |
|---|---|
| **Abrir Ink Creators** | Sobe o servidor e abre no navegador |
| **Verificar Ink Creators** | Abre com o painel de verificação por cima |
| **Parar Ink Creators** | Encerra o servidor |

Clicar duas vezes seguidas em Abrir não sobe dois servidores: ele
encerra o anterior e sobe um só.

Da primeira vez, o macOS pode perguntar se você confia no aplicativo —
é porque ele foi criado aqui e não veio de uma loja. **Abrir** resolve.
Se ele não deixar, clique com o botão direito → Abrir.

---

## Por que as janelas de Terminal se acumulavam

Não era o que os arquivos `.command` faziam. Era o que sobrava depois:
uma janela de Terminal por clique.

Eu tentava fechá-la sozinho, mas quem fecha é um comando que **pede ao
Terminal para se fechar** — e o macOS exige permissão para um programa
controlar outro. Se essa permissão nunca foi concedida, ou foi negada
uma vez, o pedido falha em silêncio. Eu ainda mandava o erro para o
lixo, então nem aviso aparecia. A cada clique, mais uma janela.

Da última vez eu tratei o sintoma: escrevi os aplicativos, que não
dependem de permissão nenhuma porque **nunca abrem janela**. Mas deixei
os `.command` na pasta principal, ao lado deles — e eles continuaram
sendo o que a mão alcança primeiro. Um arquivo que não deve ser clicado
não pode ficar onde se clica.

Agora eles moram em **`bin/atalhos-terminal/`**, longe do caminho. A
pasta principal só tem os aplicativos, e não há mais o que clicar por
engano.

Se algum dia o aplicativo falhar, é lá que está o atalho equivalente —
ele abre uma janela de propósito, para você poder ler o erro e me
contar.

---

## Onde a lógica mora

Em `bin/prototipo.sh`, com três ações: `abrir`, `verificar`, `parar`.
Os aplicativos e os atalhos são só portas de entrada para o mesmo
arquivo — antes a lógica estava duplicada, e era isso que fazia um
funcionar e o outro não depois de cada ajuste.

O servidor responde `no-store` em tudo e o endereço leva um carimbo de
tempo, então você nunca vê a versão anterior.

---

## Se um dia clicar e não acontecer nada

Sem janela de Terminal também não há mensagem de erro para ler. Por
isso o script anota tudo o que fez em `/tmp/ink-creators.log`. Abra o
atalho de emergência em `bin/atalhos-terminal/` e rode:

```
cat /tmp/ink-creators.log
```

A última linha diz até onde ele chegou.

---

## E para enviar ao ar

**`ENVIAR-E-TESTAR.command`** continua sendo `.command` de propósito:
ele imprime o andamento do envio e os três links no fim, e essa janela
você quer ler. Ela fecha quando você apertar Enter.
