# 011 — Onde mora o ping que mantém o banco acordado

16 de agosto de 2026

## O problema, na raiz

O plano gratuito do Supabase pausa o projeto depois de sete dias de
baixa atividade. Foi o que aconteceu: o banco pausou sozinho e o modo
"banco real" parou de funcionar sem ninguém perceber.

O ping diário é **remendo**, não solução. A solução é o plano Pro, onde
projeto não pausa. Enquanto o produto não tem gente dentro, o remendo
serve.

## O que aconteceu, na ordem

**1.** Escrevi o ping como GitHub Actions — um arquivo em
`.github/workflows/` que consulta o catálogo de estilos todo dia às 6h.
Infraestrutura gratuita, independente do computador dela.

**2.** O envio para o GitHub falhou:

```
refusing to allow a Personal Access Token to create or update
workflow `.github/workflows/manter-banco-acordado.yml`
without `workflow` scope
```

O GitHub não deixa um token mexer em arquivos de workflow sem permissão
específica. É proteção deles, e faz sentido: quem controla um workflow
controla o que roda na infraestrutura do GitHub, com acesso ao
repositório inteiro.

**3.** Ela pediu para resolver na raiz. Eu apresentei três caminhos —
plano Pro, tarefa agendada, ou ampliar o token — e argumentei contra
ampliar: seria trocar permissão permanente por remendo temporário. Ela
escolheu a tarefa agendada, e eu tirei o workflow do repositório.

**4.** Minutos depois, ela concedeu o escopo `workflow` ao token.

## A decisão final

**O ping volta para o GitHub Actions.**

A concessão do escopo desmonta o argumento que motivou a saída. O que eu
apontei como custo deixou de ser troca: a permissão já existe, por
decisão dela.

Com a permissão concedida, comparando os dois lugares:

| | GitHub Actions | Tarefa agendada |
|---|---|---|
| Depende do Mac ligado | não | não |
| Depende de assinatura | não | **sim, do Claude** |
| Custo | zero | zero |
| Onde o registro fica | no repositório, versionado | fora do projeto |
| Permissão extra | já concedida | nenhuma |

A linha que decide é a segunda. **O banco não deveria depender de uma
assinatura que existe para outra finalidade.** Se ela pausar o Claude
por um mês, o banco dorme junto — e ninguém liga os dois fatos, porque
não há nada no projeto que sugira essa ligação.

## O erro de método, registrado

Eu propus GitHub Actions, bati numa permissão, e recuei para uma opção
pior em vez de perguntar se conceder a permissão era aceitável. O recuo
custou dois commits e um documento reescrito.

**A lição:** quando o obstáculo é uma permissão que a pessoa controla, a
primeira pergunta é se ela quer concedê-la — não qual caminho evita
pedir. Eu tratei a permissão como custo fixo quando ela era uma escolha
dela.

## O que continua aberto

O Pro fecha três coisas de uma vez, e nenhuma é urgente hoje:

| Pendência | Por que precisa do Pro |
|---|---|
| Banco pausando sozinho | projeto pago não pausa, e o ping some de vez |
| Proteção contra senha vazada | recurso exclusivo do Pro |
| Ambiente separado para testar migração | branches de banco são do Pro |

Três motivos apontando para o mesmo lugar, todos vencendo **antes do
piloto**, nenhum vencendo hoje.
