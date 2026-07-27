# Confirmação de e-mail no cadastro

> **Situação em 27/07/2026.** A confirmação **já está ligada** — a
> primeira conta (`theinkcreatorsapp@gmail.com`) foi criada e o Supabase
> registrou que o e-mail de confirmação saiu. Ela consta como pendente
> até você clicar no link. Papéis: `admin`, `artist`, `client`.

Duas coisas para ligar no painel do Supabase, e uma restrição que muda
o plano.

---

## A restrição, primeiro

O provedor de e-mail embutido do Supabase envia **2 e-mails por hora**
— no projeto inteiro, somando todos os usuários. Não dá para aumentar:
só trocando por um SMTP próprio.

Fonte: <https://supabase.com/docs/guides/auth/rate-limits>

**O que isso significa na prática.** Se você abrir cadastro real para
dez pessoas, a terceira em diante não recebe o e-mail e fica travada
sem entender por quê. Cinco horas para dez pessoas entrarem.

**O que isso não afeta.** O teste com usuários pelo link `?teste=1` não
cria conta no Supabase — ele grava em `teste_sessoes`, que não manda
e-mail nenhum. O teste está livre desse limite.

**Quando precisar abrir cadastro de verdade:** SMTP próprio.
[Resend](https://resend.com) e [Brevo](https://brevo.com) têm plano
gratuito suficiente para começar (3.000 e 9.000 e-mails/mês). Configura
em Authentication → Emails → SMTP Settings.

---

## 1. Ligar a confirmação

Em <https://supabase.com/dashboard/project/hdfigxygektppvlogaoj/auth/providers>:

1. Abra **Email**
2. Ligue **Confirm email**
3. **Save**

A partir daí, `signUp` cria o usuário mas **não devolve sessão** até a
pessoa clicar no link.

---

## 2. Dizer para onde o link volta

Este é o passo que quase todo mundo esquece, e o sintoma é cruel: o
e-mail chega, a pessoa clica, e cai em `localhost:3000` — que não existe
no celular dela.

Em <https://supabase.com/dashboard/project/hdfigxygektppvlogaoj/auth/url-configuration>:

| Campo | Valor |
|---|---|
| **Site URL** | `https://norbgt.github.io/InkCreators/` |
| **Redirect URLs** | `https://norbgt.github.io/InkCreators/**` |

Acrescente também `http://localhost:8765/**` para funcionar quando você
testa pelo `abrir-prototipo.command`.

O código já manda o endereço de retorno em cada cadastro
(`emailRedirectTo`), mas o Supabase só aceita endereços que estejam
nessa lista. Sem a lista, ele ignora e usa a Site URL.

---

## 3. O que o protótipo faz com isso

**Ao criar a conta**, a pessoa passa a constar como pendente.

**Na gestão do estúdio → perfil**, um aviso amarelo aparece e fica até
deixar de ser verdade:

> **Confirme seu e-mail.** Mandamos um link para você. Enquanto você não
> clicar nele, não conseguimos avisar sobre orçamentos que chegarem nem
> recuperar sua senha.

Com dois botões: **Reenviar e-mail** e **Já confirmei**.

Três decisões por trás disso:

**Amarelo, não vermelho.** É pendência, não erro. O perfil continua no
ar e o aviso diz isso, para a pessoa não achar que está bloqueada.

**Na gestão, não numa notificação.** Notificação passa; quem não clicou
no link também não vai ver o aviso sobre o link. A gestão é onde o
tatuador volta.

**Diz a consequência, não a obrigação.** "Não conseguimos avisar sobre
orçamentos" move mais do que "confirme seu cadastro".

O limite de envio aparece traduzido quando acontece, em vez de um erro
técnico — a pessoa saber que precisa esperar é melhor do que ela clicar
sete vezes.

---

## O que uma conta pendente pode fazer

Decidido em 27/07/2026. Sem e-mail confirmado, a conta **navega e não
produz**.

| | Pendente | Confirmada |
|---|---|---|
| Ver catálogo, perfis, portfólios | sim | sim |
| Ver agenda de um tatuador | sim | sim |
| Seguir, salvar, curtir | sim | sim |
| Editar o próprio cadastro | sim | sim |
| Publicar perfil, portfólio, preços | **não** | sim |
| Conversar | **não** | sim |
| Pedir orçamento | **não** | sim |
| Responder orçamento | **não** | sim |

Duas coisas continuam liberadas de propósito. **Editar o próprio
cadastro**, porque travar isso deixaria a pessoa sem poder consertar um
e-mail digitado errado — que é justamente a causa mais provável de ela
não ter recebido nada. E **seguir e salvar**, porque é preferência de
navegação, não conteúdo publicado nem contato com outra pessoa.

### Onde a regra vive

**No banco**, na migração 24. Cada política de escrita das tabelas de
conteúdo e de orçamento passou a exigir `private.email_confirmado()`.

Isso importa: a chave publicável está no navegador de todo mundo, e
qualquer pessoa pode chamar a API direto. Trava que só existe na tela é
sugestão.

Testado com duas contas, uma confirmada e outra não: a pendente não cria
perfil de artista, não pede orçamento e não põe foto em portfólio
nenhum; a confirmada faz as três. E a pendente continua lendo o catálogo
e editando o próprio cadastro.

### Na tela

Os botões travados **não ficam apagados**. Botão desabilitado não
explica nada e deixa a pessoa sem saber o que fazer. Eles ficam
tracejados, em amarelo, e o clique abre uma explicação com o que ela
pode fazer agora, o que fica esperando, por que exigimos, e os botões
de reenviar e de conferir.

---

## O risco que essa decisão cria

Bloquear no começo, quando o e-mail pode ter caído no spam, é a forma
mais rápida de perder alguém que teria ficado. Some isso ao limite de 2
e-mails por hora do provedor padrão e você tem um funil que fecha
sozinho.

Duas coisas reduzem isso, e nenhuma está feita:

1. **SMTP próprio**, que tira o limite e melhora a entrega — e-mail que
   sai de domínio próprio cai menos no spam.
2. **Medir quantos confirmam.** Se a taxa vier baixa, o problema não é
   a regra: é o e-mail não estar chegando.
