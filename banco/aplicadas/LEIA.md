# Migrações aplicadas no banco

Estas são as migrações realmente aplicadas no projeto Supabase
`hdfigxygektppvlogaoj`, em 26 de julho de 2026.

As pastas `migracoes/` e `correcoes/` guardam o histórico do projeto
antigo, do Lovable. Esta pasta guarda o que existe **hoje** no banco em
produção. Quando divergirem, esta é a verdade.

## Ordem aplicada

| # | Nome | O que fez |
|---|---|---|
| 01 | esquema_base | 10 tabelas, RLS, gatilhos, buckets |
| 02 | endurecimento_instagram_e_precos | Instagram OAuth, tabela de preços |
| 03 | portfolio_enriquecido_e_derivados | Catalogação por IA, atributos derivados |
| 04 | estende_enum_quote_status | Novos estados de orçamento |
| 05 | fluxo_de_propostas_e_storage | Propostas, valores, mensagens |
| 06 | politicas_finais_storage_e_artistas | Estado final das políticas |
| 07 | restringe_leitura_de_perfis | **Correção de segurança** |
| 08 | modelo_de_papeis_cliente_tatuador | Papéis aditivos |
| 09 | popula_catalogo_de_estilos | 15 estilos de referência |
| 10 | move_has_role_para_schema_privado | **Correção de segurança** |
| 11 | corrige_permissao_de_has_role_para_anon | **Correção de regressão** |
| 12 | quebra_recursao_entre_orcamentos_e_propostas | **Correção de defeito latente** |

## Os três problemas encontrados por teste

Nenhum destes apareceu por leitura de código. Todos surgiram ao simular
um visitante anônimo consultando o banco.

**Leitura irrestrita de perfis** (migração 07). A política original era
`USING (true)`: qualquer portador da chave pública lia nome, cidade, bio
e foto de todos os usuários, inclusive de clientes que só pediram um
orçamento. Vinha do schema original e nunca foi revogada.

**Função de papel exposta pela API** (migrações 10 e 11). `has_role`
morava no schema `public`, que o PostgREST publica em `/rest/v1/rpc`.
Qualquer usuário logado podia perguntar se outra pessoa era admin. Mover
para um schema privado resolveu — mas quebrou o acesso do visitante
anônimo, porque as políticas chamam a função dentro de expressões `OR` e
o Postgres não garante curto-circuito. O catálogo público ficaria
inacessível para quem não está logado. Corrigido devolvendo a permissão,
o que é seguro porque o schema privado não é publicado pela API.

**Recursão infinita** (migração 12). A política de `quote_requests`
consultava `quote_matches`, cuja política consultava `quote_requests` de
volta. O Postgres aborta com erro. Isso derrubaria o fluxo de orçamentos
inteiro — o núcleo do produto. Corrigido movendo as checagens cruzadas
para funções que consultam sem disparar a RLS da outra tabela.

Havia também duas políticas idênticas para o mesmo caso, vindas das
migrações 01 e 09 do projeto antigo. Foram consolidadas.

## Como verificar que continua correto

```sql
SET LOCAL ROLE anon;
SELECT count(*) FROM profiles;
```

Deve retornar apenas perfis de tatuadores publicados. Se retornar mais,
alguma política regrediu.
