# 012 — Interface #2, e a prova de que nada se perdeu

19 de agosto de 2026

## O pedido

> "não quero perder nada. quero simplificar a visualização tô todo na
> experiência"
>
> "vamos adotar um visual mais clean, tome o md em anexo como referência
> (é meu portfólio)"

Duas coisas que costumam brigar: simplificar e não perder. Simplificar
quase sempre significa tirar, e tirar é perder. A saída foi tratar as
duas como uma coisa só — **nada sai, tudo muda de peso** — e depois
provar isso com código em vez de afirmar.

## O que ficou congelado

A interface #1 não foi sobrescrita. Está em três lugares:

- `git tag interface-1`
- `backups/interface-1/InkCreators-interface-1-2026-08-19.zip`
- `backups/interface-1/index-interface-1.html`, o arquivo cru

O terceiro é o que importa aqui: sem um "antes" que roda, não existe
comparação, só memória — e memória é justamente o que falha depois de
seis mil linhas de mudança.

## A gramática que veio do portfólio

Um traço, três raios, escala fluida, uma duração.

| | interface #1 | interface #2 |
|---|---|---|
| espessura de traço | 1px e 2px, misturadas | `--hair:1px`, só |
| raios | seis valores | `2px`, `4px`, `999px` |
| tipografia | tamanhos fixos em px | `clamp()`, fluida |
| movimento | quatro durações | `200ms`, e `380ms` para o lento |
| famílias | uma pilha de sistema | três, cada uma com um papel |
| acento | violeta | petróleo `#215a60` |

O petróleo tem 7,8:1 contra branco e 7,8:1 de branco contra ele. Serve
de texto e de preenchimento, o que economiza um token e uma decisão.

Os **nomes** dos tokens foram preservados de propósito. Cerca de 750
linhas de CSS dependem deles; renomear teria sido uma segunda mudança,
invisível, escondida dentro da primeira.

Um achado do caminho: `--accent-bd` era usado em quatro regras e nunca
tinha sido definido. Estava vindo herdado por acidente desde o começo.

## O feed em masonry

Tatuagem não cabe em 4:3. A interface #1 recortava toda foto para caber
na grade, o que é editar o trabalho de outra pessoa sem pedir.

Agora a foto define a altura do card, as colunas correm independentes, e
o card inteiro é o botão que leva ao perfil. As ações — orçar, agenda,
seguir — saíram da faixa fixa e aparecem no hover. No toque, onde hover
não existe, elas somem e o card inteiro leva ao perfil: botão que não
aparece é pior que botão que não existe.

## A prova

`diagnostico/nada-se-perdeu.js` monta as duas interfaces em memória,
renderiza **38 telas** em cada uma — 31 rotas por papel, mais 7 gavetas
— extrai o texto visível e pergunta, tela a tela: existe alguma frase
que a #1 mostrava aqui e a #2 não mostra mais?

**792 frases. Nenhuma perdida.**

Três decisões de desenho que fazem esse número valer alguma coisa:

**Texto, e não estrutura.** Classe de CSS que muda de nome não é perda.
Botão que sumiu, explicação que evaporou, número que deixou de aparecer
— isso é. Texto visível é a medida mais próxima do que existe para quem
usa.

**Tela a tela, não corpus inteiro.** A primeira versão procurava a frase
no protótipo todo. Frase que saiu da tela do cliente e ficou só na do
tatuador passava batido — e mudar de lugar é perda para quem estava
naquela tela.

**Lista de exceções vazia.** Escrevi oito linhas de "saiu de propósito"
antes de rodar. Ao zerar a lista, o resultado foi idêntico: as oito eram
invenção minha, justificando perdas que não existiam. Uma lista dessas é
onde perda de verdade vai se esconder. Ficou vazia, e cada linha futura
precisa de motivo escrito com mais de 40 caracteres — senão o próprio
roteiro falha.

## As três sabotagens

Roteiro que nunca falhou nunca foi testado.

1. **Apaguei uma frase real** do passaporte → acusou, com a tela e a
   frase: `client/me-passaporte · Nenhum marco cobra o próximo…`
2. **Renomeei `publicacao()`** → acusou. Mas acusou com rastro de pilha,
   que parece ferramenta quebrada e não protótipo quebrado. Corrigido:
   agora diz *"interface #2 não monta — é a perda maior que existe: a
   tela não chega a nascer"*.
3. **Esvaziei a área do fornecedor** → acusou 5 telas vazias e 134
   frases perdidas.

A segunda sabotagem valeu mais que as outras duas: encontrou um defeito
no verificador, não no verificado.

## O que as gavetas ensinaram

Na primeira versão o roteiro dizia "31 telas, tudo certo" — e as gavetas
não estavam sendo medidas. `render()` não desenha gaveta; `renderDrawer()`
desenha. O roteiro chamava `render()`, recebia oito caracteres de casca,
e sete telas inteiras ficavam de fora do relatório sem que nada
reclamasse.

Daí o piso de 200 caracteres: uma tela que devolve casca não conta como
tela verificada.

## O que sobrou para as próximas rodadas

- Perfil do tatuador e página do estúdio na gramática nova (#48)
- Gestão do estúdio, cliente e fornecedor (#49)

O roteiro já cobre as duas. Qualquer frase que sumir ali vai aparecer no
relatório com o nome da tela ao lado.
