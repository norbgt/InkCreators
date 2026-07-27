# Publicar o teste e mandar o link

Quatro passos. Os três primeiros são uma vez só; o quarto se repete a
cada mudança.

---

## 1. Enviar tudo para o GitHub

Dê dois cliques em **`sincronizar-com-github.command`**.

Ele confere se escapou alguma chave, faz o commit do que faltou e envia.
No fim, imprime o endereço em que o teste vai ficar.

---

## 2. Ligar o GitHub Pages

Uma vez só, no navegador:

1. Vá em <https://github.com/norbgt/InkCreators/settings/pages>
2. Em **Source**, escolha **Deploy from a branch**
3. Em **Branch**, escolha **main** e a pasta **/ (root)**
4. **Save**

Espere de um a dois minutos. O endereço fica:

```
https://norbgt.github.io/InkCreators/
```

A raiz redireciona sozinha para o protótipo, levando junto o `?teste=1`.

> Se o repositório for privado, o Pages exige plano pago. Nesse caso,
> deixe o repositório público — não há segredo nele: as chaves estão no
> `.gitignore` e a chave do Supabase que aparece no código é a
> publicável, que sozinha não abre nada.

---

## 3. Criar sua conta de admin

O painel mostra nome e e-mail de quem participou. Por isso ele exige
login, e não a chave pública.

1. Abra o protótipo publicado
2. Menu superior → **conexão com o banco** → crie uma conta com o seu
   e-mail
3. Me avise qual e-mail usou. Eu dou o papel `admin` a ele.

Enquanto isso não acontecer, o painel diz que a conta não é admin — que
é exatamente o comportamento certo, e não um erro.

---

## 4. Mandar o link

O link do teste é:

```
https://norbgt.github.io/InkCreators/?teste=1
```

Ele também aparece pronto para copiar dentro do próprio protótipo, em
**modelo de negócio → Painel do teste**.

**O `?teste=1` é o que liga a coleta.** Sem ele, o protótipo funciona
igual e não registra nada — inclusive quando você mesma navega para
conferir alguma coisa.

### Como o teste começa

Visitante, na descoberta, com o catálogo fictício: doze tatuadores,
vinte produtos, dez eventos e seis cursos. Ninguém precisa criar conta
para navegar — e é justamente o que queremos medir primeiro, o que a
pessoa entende sem estar logada.

A barra de desenvolvimento (papel, banco, modelo de negócio) fica
escondida durante o teste, e as rotas internas desviam para a home.
Não é esconder sujeira: é que trocar para "banco real" mostraria um
catálogo vazio, porque não existe tatuador cadastrado ainda — e o
participante estaria testando outra coisa.

### O que a pessoa vê

Antes de qualquer tela, uma entrada pedindo nome, e-mail e se ela chega
como cliente, tatuador ou fornecedor. Junto, o que é registrado (telas,
cliques, tempo) e o que não é (nada digitado, nenhum IP). Só depois de
marcar que concordou é que o botão de começar destrava.

Se fechar e voltar depois, retoma de onde parou, sem passar pela entrada
de novo.

### Uma sugestão sobre o convite

Não explique o produto na mensagem. O que você quer descobrir é o que a
pessoa entende sozinha — e uma explicação prévia apaga justamente isso.
Algo como:

> Fiz um protótipo de uma plataforma para conectar quem quer tatuar com
> tatuadores. Você abre e navega uns dez minutos como se fosse usar de
> verdade? Não precisa me dar feedback depois: eu vejo por onde você
> andou. Link: …

---

## Antes de mandar: conferir no navegador

Dois cliques em **`verificar-prototipo.command`**.

Um painel aparece por cima dizendo o que passou e o que não passou. Ele
usa campos de verdade, no seu navegador — é o único jeito de conferir
coisas que só acontecem no navegador, como o cursor sumir ao digitar.

Os testes que rodam pelo terminal (`node diagnostico/prontidao-do-teste.js`)
usam um DOM simulado: pegam erro de lógica, não pegam comportamento de
navegador. Os dois se complementam.

---

## Como ler o resultado

**modelo de negócio → Painel do teste**, botão **Carregar dados**.

O que mais importa costuma ser, nesta ordem:

1. **Última tela antes de sair.** Se muita gente para no mesmo lugar e
   não é o fim de um fluxo, o problema está ali.
2. **Telas que ninguém abriu.** Ou não interessam, ou não têm porta de
   entrada. As duas conclusões são úteis.
3. **Até onde cada um foi.** O degrau onde o funil despenca é a próxima
   coisa a consertar.
4. **Tempo mediano por tela.** Tempo alto pode ser interesse ou
   confusão — cruze com a taxa de saída daquela mesma tela para saber
   qual dos dois.

---

## Se alguém pedir para ser excluído

No SQL Editor do Supabase, logada com sua conta admin:

```sql
select public.esquecer_participante('email-da-pessoa@exemplo.com');
```

Apaga a sessão e, por cascata, todos os eventos. Devolve quantas linhas
foram apagadas.

---

## Depois do teste

Quando terminar de ler os resultados, apague os dados pessoais. Guardar
nome e e-mail sem finalidade ativa é o tipo de coisa que a LGPD trata
como excesso, e não custa nada evitar:

```sql
delete from public.teste_sessoes where criado_em < now() - interval '30 days';
```
