# 011 — Onde mora o ping que mantém o banco acordado

16 de agosto de 2026

## O problema, na raiz

O plano gratuito do Supabase pausa o projeto depois de sete dias de
baixa atividade. Foi o que aconteceu: o banco pausou sozinho e o modo
"banco real" parou de funcionar sem ninguém perceber.

O ping diário é **remendo**, não solução. A solução é o plano Pro, onde
projeto não pausa. Enquanto o produto não tem gente dentro, o remendo
serve.

## O caminho que não deu certo

Primeiro tentei GitHub Actions: um arquivo em `.github/workflows/` que
consulta o catálogo de estilos todo dia às 6h. Tecnicamente é o lugar
certo — infraestrutura gratuita, independente do computador dela.

Mas o envio para o GitHub falhou:

```
refusing to allow a Personal Access Token to create or update
workflow `.github/workflows/manter-banco-acordado.yml`
without `workflow` scope
```

O GitHub não deixa um token criar ou alterar arquivos de workflow sem
uma permissão específica. É proteção deles, e faz sentido: quem controla
um workflow controla o que roda na infraestrutura do GitHub, com acesso
ao repositório inteiro.

**A saída óbvia seria ampliar o token.** Dois minutos. Mas isso é trocar
uma permissão permanente por um remendo temporário — e travou o envio de
vinte commits que não tinham nada a ver com o assunto. Um remendo que
bloqueia o fluxo principal deixou de ser barato.

## A decisão

**O ping sai do repositório e vira tarefa agendada.**

- Roda uma vez por dia, em servidor, sem depender do Mac estar ligado
- Nenhum arquivo de workflow, nenhuma permissão nova no token
- O envio para o GitHub volta a ser o que era: só arquivos

## O custo, dito

Isso amarra a atividade do banco à assinatura do Claude. Se ela pausar,
o ping para, e o banco volta a dormir em sete dias.

É aceitável agora porque **não há ninguém usando o produto** — o pior
caso é ela reabrir o painel e retomar. Deixa de ser aceitável no dia do
piloto, e é exatamente por isso que o plano Pro continua na lista.

## O que continua aberto

O Pro fecha três coisas de uma vez, e nenhuma delas é urgente hoje:

| Pendência | Por que precisa do Pro |
|---|---|
| Banco pausando sozinho | projeto pago não pausa, e o ping some de vez |
| Proteção contra senha vazada | recurso exclusivo do Pro |
| Ambiente separado para testar migração | branches de banco são do Pro |

Três motivos apontando para o mesmo lugar, todos vencendo **antes do
piloto**, nenhum vencendo hoje.
