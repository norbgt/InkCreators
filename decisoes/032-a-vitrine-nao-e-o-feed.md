# 032 — A vitrine não é o feed

19 de agosto de 2026

## O pedido

> "a grade de cards na loja tem proposta diferente do feed: aqui a grade
> deve ser ordenada e com tamanho padrão entre os cards, no mínimo duas
> colunas, no máximo 4. e o usuário pode escolher ver em lista"

## Duas grades, duas perguntas

A loja usava o componente do feed — `.feedposts`, masonry, coluna
independente. Você viu antes de mim que isso estava errado, e a razão é
mais funda que estética.

**O feed pergunta "que trabalho é esse?"** A foto *é* o produto. Cada
tatuagem tem a sua proporção, e recortar todas para caber numa grade é
editar o trabalho de alguém sem pedir. Masonry existe ali exatamente
para isso.

**A loja pergunta "qual destes eu levo?"** A foto é embalagem. O que
decide é preço, nota, marca — e comparar exige que essas três fiquem na
mesma altura de um card para o outro.

Masonry desalinha de propósito. Num feed isso é ritmo; num catálogo é a
pessoa **reancorando o olho a cada card** para achar de novo onde estava
o preço.

## O que faz a grade ser regular

O `grid` é a parte fácil. O que a mantém regular de verdade são duas
linhas de CSS:

```css
.prod   { height:100% }        /* o card ocupa a célula inteira */
.prodpe { margin-top:auto }    /* o preço desce até o pé */
```

Sem elas a grade é reta e o conteúdo dentro dela não é — que é o pior
dos dois mundos: a moldura promete alinhamento e o miolo não entrega. O
nome ganhou corte em duas linhas pela mesma razão: nome de produto varia
de 3 a 60 caracteres, e era ele que esticaria a fileira toda.

## Duas no piso, quatro no teto

Seus dois números, e cada extremo tem uma razão:

- **Menos de duas** — o catálogo vira fila e a comparação some. É a
  mesma razão do piso de duas colunas no feed.
- **Mais de quatro** — a foto do produto fica menor que o polegar e a
  nota deixa de ser legível.

`2 · 560px → 3 · 1100px → 4`, dentro do conjunto fechado de pontos de
quebra.

## Lista: um componente, dois arranjos

Não é outra tela. É a mesma grade com uma coluna e o card deitado —
mesma marcação, uma classe a mais.

Quem chega sabendo o que quer lê nome e preço mais rápido em lista; quem
está garimpando vê mais produto por tela na grade. Duas perguntas, dois
arranjos, um componente. A escolha sobrevive à recarga.

## O teste que quase virou fé

"Trocar de vista não perde nada" parecia um bom teste, e sozinho seria
inútil: como grade e lista saem do **mesmo render**, o HTML é idêntico
por construção e nenhuma sabotagem de código o faria falhar.

Onde a perda pode acontecer de verdade é no **CSS**. Basta um
`display:none` dentro de `.vitrine.lista` para um campo sumir da tela
continuando no HTML — o buraco que a decisão 012 já tinha registrado.

O guarda passou a ler o CSS: some o que é controle (seta e pip, que a
88px cobrem metade da foto), nunca o que é informação. Sabotado
escondendo a marca em lista — acusou, com o nome do campo.

## Três, o lote errado

A loja carregava 3 produtos por vez. Três era o número de quando o card
ocupava a largura toda; numa grade de quatro colunas, três cards não
fecham nem a primeira fileira, e sobra no meio da última linha parece
catálogo acabando.

Doze fecha fileira em duas, três e quatro colunas.

**E o teste disso nasceu errado:** eu procurava `S.feedLote*(\d+)` no
arquivo inteiro e pegava o do **feed**, que carrega 8 e não precisa
fechar fileira nenhuma porque masonry não tem fileira. Acusei a loja
pelo número do feed. Agora ele lê só o corpo de `listaLoja`.

## E o estado que ficou para trás

O bloco novo deixava `S.tab = "shop"` ligado, e **dezoito checagens
seguintes falharam** — todas pedindo o feed e recebendo a loja. É a
terceira vez neste arquivo: antes foram um check-in aberto e um papel
trocado.

Quem herda a sujeira falha por ela, não pelo que mede, e o relatório
passa a acusar a tela errada.

## Sabotagens

1. Loja de volta ao `.feedposts` → acusou.
2. Cinco colunas no desktop → acusou: *"colunas declaradas: 2, 3, 5"*.
3. Uma coluna no telefone → acusou duas vezes.
4. Preço deixa de descer até o pé → acusou.
5. Lista esconde a marca por CSS → acusou pelo nome do campo.
6. Lote de volta a três → acusou.

---

## Segunda parte: sai "Desempenho por estilo"

> "vamos remover 'Desempenho por estilo' da area de gestão do tatuador"

Feito. Reputação passou de três seções para duas: **Avaliações** e
**Onde eu tatuei**.

### O que morava ali

Dois cartões, e eles não eram iguais em valor.

**"Onde você tatuou"** era a segunda resposta para a pergunta que "Onde
eu tatuei" já respondia. A diferença era só a fonte — este lia os
check-ins, aquele lê o histórico de estúdios. Duas listas de lugares na
mesma aba, com títulos quase idênticos. Sai sem custo.

**"Quanto tempo leva, por estilo"** é outra história, e preciso ser
claro sobre ela.

### O custo, dito por inteiro

Aquela tabela era **o único lugar do produto onde o relógio do check-in
virava número visível**: duração média e mais longa, por estilo, medida
e não lembrada. Era o argumento do check-in para quem tatua — *"é o
número que faz o orçamento parar de ser chute"*.

O cálculo continua de pé: `desempenhoPorEstilo()` ainda roda e ainda
alimenta a faixa de trajetória — mas só com os **nomes** dos estilos. As
**durações** continuam sendo computadas e não aparecem em tela nenhuma.

Registrei isso como teste, não como parágrafo: o diagnóstico agora varre
as cinco abas do tatuador e falha se a tabela reaparecer sem decisão, e
falha também se o cálculo morrer. Assim o custo não é esquecido nem
descoberto por acaso.

Se quiser a tabela de volta em outro lugar — a visão geral é o candidato
natural — é uma linha.

### Função também sai, com motivo escrito

`lugaresDoCheckin()` ficou sem nenhum uso. O guarda "nenhuma função
sumiu" não tinha lista de exceções, o que me deixava com duas saídas
ruins: manter código morto vivo só para o teste passar, ou apagar a
linha do teste.

Ganhou a mesma disciplina do texto — nome declarado, motivo com mais de
40 caracteres, e uma checagem de que a função **realmente** saiu, para a
lista não virar depósito.

### Sabotagens desta parte

7. A seção volta ao trilho → acusou: *"2 peças no toggle → 3 peças"*.
8. Motivo de saída curto demais → acusou.
9. Função declarada como saída que continua no código → acusou.
10. O cálculo do relógio morre junto → acusou três vezes.

**11 roteiros, 0 falhas. 702 frases, 6 saídas novas com motivo escrito.**

---

## Terceira parte: um componente, não uma cópia parecida

> "os cards das lojas estão ruins, garanta carrossel de imagens +
> descrição, garanta mais consistência com o componente dos cards do
> feed"

### Consistência não se cumpre escrevendo CSS parecido

Essa foi a parte que eu tinha feito errado. O card da loja era um
componente **próprio**, com aparência parecida com a do feed: borda,
fundo de cartão, foto sem carrossel de verdade, um emoji trocando de
lugar.

Cópia parecida envelhece sozinha. Daqui a três rodadas as duas telas
divergem sem ninguém ter decidido nada — e a divergência aparece como
"o site está inconsistente", que é a frase que ninguém consegue
depurar.

Agora o card da loja **carrega as duas classes**:

```html
<article class="post prod">
```

`post` traz a foto, o carrossel, as setas, os pips e o hover. `prod`
acrescenta só o que a grade regular exige: altura de célula inteira e
nenhuma margem de masonry. A borda e o fundo de cartão saíram — o feed
não tem, e agora a loja também não.

### Carrossel de verdade

Três fotos por produto, montadas como o feed monta: todos os slides
presentes, só o ativo visível. Setas, pips e a etiqueta de destaque —
"Mais vendido", "Oferta" — que saiu do meio do texto e virou tarja sobre
a foto, como no feed.

### Descrição, e por que não no hover

Os vinte produtos ganharam uma frase que diz o que a coisa faz e para
quem: *"Traço fino e contínuo, para contorno. Ponta de 0,30mm,
esterilizado, uso único."*

O feed resolve as linhas extras com hover. Aqui não pode: **no toque o
hover não existe**, e quem compra decide pelo que a coisa faz. A
descrição fica visível, cortada em duas linhas.

### A armadilha que a herança criou

A seta do carrossel só aparece por `.post:hover .postimg .nav`. Se o
card perder a classe `post`, o botão continua no HTML e **nunca aparece
na tela** — o defeito que já apareceu neste projeto três vezes: existir
sem estar ao alcance.

O teste não confere que a seta existe. Ele lê a **regra** de CSS que a
revela, extrai a classe que ela exige, e confere se essa classe está no
card da loja. Sabotado tirando `post` do card — acusou: *"a regra pede
.post e o card da loja não tem — seta invisível"*.

### E o teste do carrossel nasceu errado outra vez

Primeira versão: eu mudava `S.caro` na mão e conferia que o slide ligado
mudava. **Sabotei o `onclick` da seta para não fazer nada e o teste
passou** — porque ele nunca tocou na seta.

É a mesma armadilha de sempre, na forma mais pura: medir o efeito quando
o defeito está no gatilho. Um botão que não faz nada é indistinguível de
um botão que funciona, se o teste chama a função por trás dele.

Agora ele extrai o `onclick` do botão renderizado e executa exatamente o
que o dedo executaria.

### Sabotagens desta parte

11. Card sem a classe `post` → acusou quatro vezes.
12. Um produto sem descrição → acusou pelo nome.
13. Descrição escondida atrás do mouse → acusou.
14. Seta com `onclick` morto → acusou (depois de o teste ser
    consertado).
15. Uma foto em vez de três → acusou.

**11 roteiros, 0 falhas.**
