# Telemetria do teste com usuários

Aplicada em 26/07/2026 nas migrações `19_telemetria_do_teste` e
`20_trigger_de_telemetria_fora_da_api`.

## Por que existe backend aqui

Pelo combinado de `003-prototipo-primeiro.md`, o backend só se move
quando eu apontar a necessidade. Este é o caso: telemetria que mora no
navegador não agrega nada entre participantes, e o painel leria um
único aparelho. Não há como fazer no protótipo.

## As duas tabelas

`teste_sessoes` — um participante. Nome, e-mail, perfil declarado,
consentimento, e as dimensões do aparelho. **Sem IP:** não coletamos.

`teste_eventos` — cada passo. Rota, alvo do clique, tempo na tela.
**Sem conteúdo digitado:** nada do que a pessoa escreve em campo é
enviado.

## Como o acesso está fechado

| Quem | Escrever | Ler | Apagar |
|---|---|---|---|
| Anônimo (participante) | sim | **não** | não |
| Autenticado sem papel admin | sim | **não** | não |
| Admin | sim | sim | sim |

O participante não lê nem o que ele mesmo escreveu. O `id` da sessão é
gerado no navegador justamente para o insert não precisar devolver
nada — se precisasse, anon ganharia SELECT.

Nenhuma das duas aceita UPDATE: evento registrado não se reescreve.

## O que foi testado contra o banco, não lido no código

Todos bloqueados:

- evento apontando para sessão que não existe
- sessão sem consentimento
- e-mail malformado
- perfil fora de cliente/tatuador/fornecedor
- consentimento datado no futuro
- anônimo apagando sessões
- anônimo chamando a exclusão de LGPD
- anônimo lendo a tabela

E funcionando: anon consegue registrar sessão e evento.

## Teto por sessão

Endpoint de escrita aberto sem teto é convite. Um gatilho recusa acima
de 5000 eventos por sessão — muito acima de qualquer teste real.

O gatilho vive no schema `private`. Em `public` ele virava
`/rest/v1/rpc/limita_eventos_do_teste`, exposto sem motivo. O linter de
segurança apontou e foi corrigido na migração 20.

## LGPD

Coletar nome e e-mail é tratar dado pessoal. O que está pronto:

- consentimento obrigatório, gravado com data e hora na própria linha
- exclusão a pedido: `select public.esquecer_participante('email@…')`,
  que apaga a sessão e, por cascata, todos os eventos
- minimização: sem IP, sem conteúdo digitado, sem dado de terceiros

O que **ainda depende de você**, e está em `decisoes/pendencias.md`:
base legal declarada, prazo de retenção e a decisão de quando apagar
tudo depois do teste.

## Aviso do linter que fica de propósito

`esquecer_participante` aparece como "executável por usuário logado".
É intencional: precisa ser chamável por RPC para a exclusão funcionar.
Quem protege não é a visibilidade e sim a checagem de admin na primeira
linha do corpo — testada acima, anon e não-admin recebem exceção.
