# 006 — O produto é o encontro, não o cálculo

**Data:** 27 de julho de 2026
**Situação:** decidida. Refletida no protótipo, ainda não no backend.

## As três decisões

**1. O orçamento deixa de ser assistido por IA.** O cliente descreve o
que quer, mostra referências e escolhe os estilos; o pedido vai para
quem trabalha com aquilo, na cidade dele. Cada tatuador responde com o
preço dele.

**2. A proposta de valor é o ecossistema.** Pessoas, artistas, estúdios
e arte no mesmo lugar — não um orçamentista inteligente com catálogo
anexo.

**3. O que prende o tatuador é ter tudo num lugar só.** Orçamentos,
agenda, caixa e o histórico de quem ele tatuou e dos estúdios por onde
passou.

## Por que tirar a IA melhora o produto

**A promessa era a mais difícil de cumprir.** Estimar preço de tatuagem
por foto exige acertar estilo, tamanho, complexidade e tempo — e errar
por 30% em qualquer um deles produz um número que desmente o tatuador
na frente do cliente. Quem sabe quanto custa é quem vai fazer, e ele já
estava do outro lado do pedido.

**Era o único custo variável relevante.** Cada análise mandava até oito
imagens para um modelo de visão, em toda conta do catálogo, pagante ou
não. Sem isso, o custo por tatuador cai para armazenamento e banda — e
com ele cai a urgência de cobrar cedo, que era o que empurrava para a
assinatura descartada na decisão 004.

**Era a maior dependência técnica.** Chave de provedor, função de
servidor, instrumentação de custo. Some tudo do caminho crítico.

**O que se perde:** o cliente que não sabe nomear o estilo perde uma
muleta. O protótipo compensa com uma linha — "escolha os que mais
parecem com suas referências" — e com a possibilidade de escolher vários.
Vale observar isso no teste.

## O que muda na defensabilidade, e é preciso encarar

Sem a IA, nenhuma peça do produto é difícil de copiar. Catálogo,
formulário e encaminhamento são trabalho conhecido.

O que passa a defender é a **densidade**: ter os dois lados no mesmo
lugar. Isso é mais difícil de replicar que qualquer algoritmo — e
também mais difícil de começar, porque no dia um não existe.

Consequência prática: a única coisa que importa agora é fazer tatuador
entrar e voltar. Foi por isso que caixa e histórico entraram.

## Galeria

Não existe conta de galeria de arte. **Cada tatuador tem a dele**, numa
aba ao lado do portfólio: print, quadro, estampa, original. É arte dele,
e comprar não passa pelo orçamento — é peça pronta.

Isso liga duas coisas que hoje vivem separadas: o Instagram onde o
artista mostra o traço e o lugar onde ele vende o desenho.

## Caixa e histórico

Telas novas na gestão do estúdio, com dados fictícios.

**Caixa** — entrou, saiu, sobrou, e de onde veio: sessão, arte, curso.
Sessão fechada pela plataforma entraria sozinha; o resto é lançado à
mão. O que a pessoa lança é dela e ninguém mais vê.

**Histórico** — duas listas. Quem ele tatuou, com quantas sessões e
desde quando. E onde ele tatuou, incluindo guest spot e convenção,
porque tatuador é itinerante e cada estúdio guarda o próprio caderno.

A segunda lista é a que nenhum concorrente óbvio tem, justamente porque
é a que ninguém pensa em guardar.

## O que isso não resolve

O concorrente do "tudo num lugar só" é o caderno e o WhatsApp — que são
gratuitos e já estão instalados no hábito. Se o tatuador entra e não
volta, a densidade nunca aparece, e sem densidade não há ecossistema nem
destaque para vender.

Essa é a pergunta que substituiu "quanto custa um orçamento" no espaço
de trabalho do modelo de negócio, e é o que o teste com usuários precisa
começar a responder.
