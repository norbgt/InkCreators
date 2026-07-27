# O banco alcança o cadastro de três passos

Migrações `21_estilos_novos_e_formato_do_handle`,
`22_papel_de_fornecedor` e `23_acrescentar_papel_sem_duplicar_conta`,
aplicadas em 27/07/2026.

## O que o protótipo passou a exigir

| Decisão de produto | O que faltava no banco |
|---|---|
| Nome de usuário no passo 2 | Formato e nomes reservados |
| Blackout como estilo, cobertura como serviço | Os dois slugs |
| Fornecedor que também tatua | Papel `supplier` e um jeito de acrescentar papel |
| Tatuador que também vende | O mesmo, no sentido inverso |

## Nome de usuário

`profiles.handle` já existia e já era único — metade do caminho estava
feita. Faltavam duas coisas:

**Formato.** `^[a-z0-9._]{3,20}$` como restrição na tabela. Antes, só o
navegador garantia, e navegador não é lugar de garantir nada.

**Nomes reservados.** `handles_reservados`, com leitura pública de
propósito: o cadastro precisa avisar *antes* de a pessoa tentar. Um
gatilho recusa na gravação, então a tela pode falhar em avisar sem que
o dado passe.

Sem isso, alguém registra `@suporte` e passa a parecer a plataforma.

## Cobertura e blackout

Entraram em `tattoo_styles`. São 17 agora, iguais ao protótipo. Sem
eles, o tatuador que marcasse "também faço coberturas" gravaria um slug
sem correspondência na tabela de referência.

A distinção que o produto faz continua valendo no banco: blackout tem
complexidade 3 e é traço; cobertura tem 4 e a descrição diz que **não é
um traço, é um serviço** — o estilo final depende do que está por baixo.

## Acrescentar papel, nunca duplicar conta

`acrescentar_meu_papel(papel)` e `remover_meu_papel(papel)`.

Três garantias que só o banco pode dar:

- **Idempotente.** Índice único em `(user_id, role)`. Clicar duas vezes,
  ou abrir duas abas, não cria dois papéis.
- **Ninguém vira admin sozinho.** A função recusa `admin`. É o único
  papel que precisa vir de fora.
- **Cliente é o piso.** `remover_meu_papel` recusa tirar `client`: toda
  conta pode comprar e se tatuar, e ninguém perde isso sem pedir.

Deixar essa decisão só no navegador é o que produz contas duplicadas
quando a rede falha no meio.

## Testado contra o banco

Todos recusados: handle curto, handle com maiúscula, handle reservado,
anônimo acrescentando papel, qualquer um pedindo admin.

Todos funcionando: 17 estilos presentes, papel `supplier` no enum,
unicidade do handle, índice que impede papel repetido.

## O que ainda não foi feito

O protótipo em modo demonstração já se comporta assim. O modo real usa
`Dados.criarConta` com os campos novos e `Dados.usuarioDisponivel`, mas
**o ciclo completo em modo real ainda não foi percorrido ponta a ponta**
— falta uma conta de teste passando pelos três passos contra o banco.
