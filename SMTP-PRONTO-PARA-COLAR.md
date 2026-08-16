# SMTP: tudo pronto até a porta

Preparei o que dava para preparar. **Você só cria a conta e cola a
credencial** — criar conta e manipular credencial é limite meu, e é
deliberado.

Tempo estimado: 30 minutos, sendo 20 esperando a verificação do domínio.

---

## Antes de começar: você precisa de um domínio?

**Não, para testar.** O Resend deixa enviar de um domínio de teste dele
sem configurar nada. Serve para o piloto com três estúdios.

**Sim, para o piloto na rua.** E-mail vindo de `onboarding@resend.dev`
cai em spam e não passa confiança para um profissional que você está
tentando cobrar R$ 79 por mês.

Se for comprar domínio, compre antes — a verificação leva alguns minutos
e é o passo que mais atrasa.

---

## Passo 1 · Criar a conta (5 min)

[resend.com](https://resend.com) — plano gratuito, 3.000 e-mails por mês,
100 por dia. Para comparação: **o embutido do Supabase manda 2 por
hora.**

Alternativa: [Brevo](https://brevo.com), 9.000/mês. O Resend é mais
simples de configurar; o Brevo tem limite maior. Para o seu volume, o
Resend basta.

## Passo 2 · Verificar o domínio (20 min, se tiver domínio)

O Resend te dá três registros DNS para colar onde o domínio está
hospedado. Sem isso, o e-mail sai — mas cai em spam.

## Passo 3 · Pegar as credenciais SMTP

No Resend, em **SMTP**. Você vai receber:

```
Host:     smtp.resend.com
Porta:    465
Usuário:  resend
Senha:    re_xxxxxxxxx      ← esta é a credencial, trate como senha
```

## Passo 4 · Colar no Supabase

> **Supabase → Project Settings → Authentication → SMTP Settings**
> → ativar *Enable Custom SMTP*

| Campo | Valor |
|---|---|
| Sender email | `nao-responda@seudominio.com.br` (ou o de teste do Resend) |
| Sender name | `Ink Creators` |
| Host | `smtp.resend.com` |
| Port number | `465` |
| Username | `resend` |
| Password | a chave `re_...` |

**Nunca coloque a chave `re_...` em nenhum arquivo do projeto.** Ela vive
só no painel do Supabase.

## Passo 5 · Ajustar os limites

Na mesma tela, o Supabase deixa definir quantos e-mails por hora. O
padrão continua baixo mesmo depois de trocar o SMTP.

Sugestão: **30 por hora**. Suficiente para um piloto de trinta pessoas
entrando no mesmo dia, e baixo o bastante para você perceber se algo
disparar e-mail em looping.

---

## Os textos, prontos

O padrão do Supabase é em inglês e genérico. Cole estes em
**Authentication → Emails**, aba por aba.

O tom segue o do produto: direto, sem exclamação, sem "clique aqui".

### Confirm signup

**Assunto:**
```
Confirme seu e-mail — Ink Creators
```

**Corpo:**
```html
<h2 style="font-size:19px;margin:0 0 14px">Falta confirmar seu e-mail</h2>

<p style="margin:0 0 14px;line-height:1.6">
  Sua conta no Ink Creators foi criada. Confirmar o e-mail libera
  publicar seu trabalho, pedir e responder orçamentos, e conversar
  dentro da plataforma.
</p>

<p style="margin:0 0 20px;line-height:1.6">
  Enquanto isso, você já pode navegar e ver o trabalho de quem tatua
  perto de você.
</p>

<p style="margin:0 0 24px">
  <a href="{{ .ConfirmationURL }}"
     style="display:inline-block;background:#111;color:#fff;
            text-decoration:none;padding:12px 22px;border-radius:9px;
            font-weight:600">Confirmar meu e-mail</a>
</p>

<p style="margin:0;font-size:13px;color:#666;line-height:1.6">
  Se não foi você que criou esta conta, ignore esta mensagem — nada
  acontece sem essa confirmação.
</p>
```

### Magic Link

**Assunto:**
```
Seu link de entrada — Ink Creators
```

**Corpo:**
```html
<h2 style="font-size:19px;margin:0 0 14px">Entrar no Ink Creators</h2>

<p style="margin:0 0 20px;line-height:1.6">
  O link abaixo entra na sua conta e vale por uma hora.
</p>

<p style="margin:0 0 24px">
  <a href="{{ .ConfirmationURL }}"
     style="display:inline-block;background:#111;color:#fff;
            text-decoration:none;padding:12px 22px;border-radius:9px;
            font-weight:600">Entrar</a>
</p>

<p style="margin:0;font-size:13px;color:#666;line-height:1.6">
  Se você não pediu este link, ignore. Ninguém entra na sua conta sem
  ele.
</p>
```

### Reset Password

**Assunto:**
```
Trocar sua senha — Ink Creators
```

**Corpo:**
```html
<h2 style="font-size:19px;margin:0 0 14px">Trocar a senha</h2>

<p style="margin:0 0 20px;line-height:1.6">
  Alguém pediu a troca de senha desta conta. O link vale por uma hora.
</p>

<p style="margin:0 0 24px">
  <a href="{{ .ConfirmationURL }}"
     style="display:inline-block;background:#111;color:#fff;
            text-decoration:none;padding:12px 22px;border-radius:9px;
            font-weight:600">Definir nova senha</a>
</p>

<p style="margin:0;font-size:13px;color:#666;line-height:1.6">
  Se não foi você, ignore esta mensagem — sua senha continua a mesma.
</p>
```

---

## As URLs de redirecionamento

Isto costuma ser o que quebra depois: o e-mail chega, a pessoa clica, e
cai numa página de erro porque o endereço não estava autorizado.

> **Supabase → Authentication → URL Configuration**

**Site URL:**
```
https://norbgt.github.io/InkCreators/
```

**Redirect URLs** — uma por linha:
```
https://norbgt.github.io/InkCreators/**
https://norbgt.github.io/InkCreators/prototipo/index.html**
```

Se um dia houver domínio próprio, acrescente as duas equivalentes dele
sem tirar estas — os dois endereços conviverão durante a transição.

**Não precisa de endereço local.** Aberto do Finder o protótipo não fala
com o banco, então não há para onde redirecionar.

---

## Como conferir que funcionou

1. Crie uma conta com um e-mail seu que **não** seja o
   `theinkcreatorsapp@gmail.com`
2. O e-mail deve chegar em segundos, em português, com o botão preto
3. Clique e confirme que cai no protótipo publicado, logada
4. Na área de gestão, o aviso de pendência deve ter sumido

Se travar em algum desses quatro, me diga em qual — cada um falha por um
motivo diferente e o diagnóstico muda.

---

## Por que isto entrou na lista de segurança

Não é bem segurança. Está lá porque **derruba na prática uma trava de
segurança que você mesma definiu**.

A regra é: conta sem e-mail confirmado navega, não produz. Está escrita
dentro do banco, em toda política de escrita. Mas se o e-mail de
confirmação não chega, a pessoa fica presa do lado de fora sem entender
por quê — e a reação natural sua seria afrouxar a regra.

Trocar o SMTP é o que impede a regra certa de ser abandonada por um
motivo bobo.
