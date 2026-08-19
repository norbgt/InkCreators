# 013 — Cinco abas por momento, e nenhuma tela a menos

19 de agosto de 2026

## O pedido

> "a area de gestão de cada um dos perfis pode ser simplificada? de modo
> que tenha até 6 abas e sem perder nenhuma ideia/funcionalidade/conteúdo,
> a gente redistribui a informações de uma maneira mais simples e menos
> redundante"

## O que a contagem mostrou

| perfil | abas antes | abas depois |
|---|---|---|
| tatuador | 9 | 5 + configuração |
| cliente | 5 | 5 |
| fornecedor | 5 | 4 + configuração |

Mas contar abas não era o ponto. O tatuador tinha **quatro pares de
telas mostrando a mesma coisa duas vezes**:

| | | o que se repetia |
|---|---|---|
| check-in / agora | agenda / mês | as mesmas três sessões |
| caixa / lançamentos | histórico / pessoas | as mesmas pessoas, o mesmo dinheiro |
| check-in / desempenho | histórico / estúdios | os mesmos lugares |
| eventos / participo | histórico / estúdios | a mesma Convenção Sul |

Nove abas prometiam que o ofício tem nove assuntos. Não tem.

## Um erro meu, antes de qualquer decisão

Eu disse que no cliente as sub-abas "recebidos" e "enviados" renderizavam
conteúdo idêntico, e chamei isso de defeito. **Não era.** Meu script de
varredura definia a chave `orc` — que é do tatuador — também na sessão do
cliente, e a tela do cliente ignora essa chave. Renderizei a mesma tela
duas vezes e li o resultado como duplicação do produto. O cliente sempre
usou pastilhas de status, não sub-abas.

Fica registrado porque a lição é a mesma de sempre aqui: ferramenta de
medição também erra, e um erro dela parece um erro do medido.

## As cinco abas do tatuador

Agrupadas pelo momento do dia de quem tatua, não por tipo de dado.

| aba | recortes | pergunta que responde |
|---|---|---|
| **Hoje** | visão geral · check-in | o que acontece agora |
| **Orçamentos** | recebidos · enviados | quem está pedindo |
| **Agenda** | o mês · conexões | quando vai ser |
| **Dinheiro** | resumo · lançamentos · quem eu tatuei | quanto entrou |
| **Reputação** | avaliações · desempenho · onde eu tatuei · eventos | por que confiar em você |

Quando escolhemos cinco abas, o risco que levantei foi que a última
virasse depósito das sobras. Ela não virou porque tem uma pergunta
própria: **por que confiar em você.** O que dizem (avaliações), o que
você faz bem (desempenho), onde já trabalhou (estúdios), onde aparece
(eventos). Sem essa pergunta comum seria um armário.

## Configuração saiu da barra

"Meu perfil" ocupava um dos nove lugares como se fosse superfície de
trabalho. Não é — é ajuste, e ninguém abre o app para ajustar. Foi para
o fim da barra, separada por um traço, no peso de um ajuste. O mesmo
valeu para "Perfil da marca" no fornecedor.

## Aba dentro de aba, não

Duas telas tinham um segundo nível: avaliações (todas / sem resposta) e
eventos (que eu criei / que eu participo). Os dois são **recortes da
mesma lista**, não destinos diferentes.

Viraram pastilha. Aba promete outro lugar; pastilha promete a mesma
coisa vista de outro jeito. Usar aba para os dois é exatamente o que
transforma uma aba grande em depósito.

## Rota antiga não pode dar em tela branca

`S.route` é gravado no `localStorage` e no endereço. Quem já usou o
produto tem `studio-events` guardado — e abriria numa tela em branco,
que parece produto quebrado.

`traduzirRotaAntiga()` traduz antes de a tela montar. O caso mais
delicado é o histórico, que tinha duas metades que foram para abas
diferentes: se a sub-aba guardada era "pessoas", vai para Dinheiro; se
era "estúdios", vai para Reputação.

## No cliente, resumo deixou de ser cópia

A visão geral mostrava os três orçamentos mais recentes — o começo da
aba cheia, sem dizer nada de novo. Agora ordena por quem está esperando:
primeiro os que o tatuador já respondeu e dependem da decisão do
cliente, depois os que aguardam resposta dele. O título muda junto:
"Esperando você" quando há decisão pendente.

Três frases entraram em `SAIRAM_DE_PROPOSITO` por causa disso, cada uma
com o motivo escrito.

## Como a prova acompanhou a mudança

`nada-se-perdeu.js` comparava tela a tela pelo endereço. Com os
endereços mudando, ele compararia telas diferentes e acusaria perda onde
só houve mudança de lugar.

Ganhou uma tabela **`MUDOU_DE_LUGAR`**, que também é o índice de onde
procurar o que você não achar:

```
studio-checkin    → studio/checkin  +  studio-reputacao/desempenho
studio-events     → studio-reputacao/eventos
studio-reviews    → studio-reputacao/avaliacoes
studio-historico  → studio-caixa/pessoas  +  studio-reputacao/estudios
```

Uma tela da #1 podendo virar duas na #2 é o ponto: a pergunta é se o
conteúdo continua alcançável, não em qual aba ele está.

## Quatro sabotagens

1. **Sexta aba na barra** → acusou, listando as seis.
2. **Tradução de rota antiga quebrada** → acusou as quatro rotas caindo
   em telas de 2.466 caracteres, mais nove verificações de conteúdo.
3. **Avaliações de volta a aba dentro de aba** → acusou.
4. **Eventos sem destino na #2** → 16 frases perdidas, nomeadas.

## Um teste que falhava pelo motivo errado

A verificação da visão geral chamava `ir('studio')` sem dizer qual
recorte queria. Como a aba Hoje tem dois, ela dependia da ordem em que
os outros testes haviam rodado — e falhou porque um teste anterior
deixara o check-in aberto. Passou a nomear a sub-aba.

**10 roteiros, 0 falhas. 711 frases, nenhuma perdida.**
