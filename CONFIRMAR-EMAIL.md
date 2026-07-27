# Confirmação de e-mail no cadastro

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

## O que eu não fiz, e por quê

**Não bloqueei nada.** Um tatuador com e-mail não confirmado hoje
publica perfil e recebe pedidos normalmente. Dá para ser mais duro —
por exemplo, não publicar o perfil até confirmar.

O argumento a favor: pedido que chega para quem não lê e-mail é pedido
perdido, e o cliente fica esperando resposta que não vem.

O argumento contra: bloquear no começo, quando o e-mail pode ter caído
no spam, é a forma mais rápida de perder alguém que teria ficado.

É sua decisão. Se quiser bloquear, me diga onde: publicar o perfil,
receber orçamento, ou os dois.
