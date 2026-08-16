# 25 · `esquecer_participante` sai da API pública

**Aplicada em 16/08/2026.** Migração `25_tira_esquecer_participante_da_api`.

## O que era

A função apaga os dados de um participante do teste a pedido dele — o
"esqueça-me" da LGPD. Ela **já recusava quem não é admin**, na primeira
linha do corpo:

```sql
if not private.has_role(auth.uid(), 'admin') then
  raise exception 'Apenas admin pode executar esta exclusão.';
end if;
```

Mas morava no esquema `public`, e o Supabase publica tudo que está lá
como endereço de internet. Qualquer conta logada conseguia chamar
`/rest/v1/rpc/esquecer_participante`.

## Por que mudou, já que a guarda funcionava

Camada única. A guarda segurava hoje; se um dia alguém editasse a função
e esquecesse dela, não haveria segunda barreira — e o efeito seria
apagar dados de participante do teste.

O verificador de segurança do Supabase apontava isso como
`authenticated_security_definer_function_executable`.

## O que foi feito

```sql
revoke execute on function public.esquecer_participante(text)
  from anon, authenticated;
```

Nada mudou no comportamento. Você continua chamando pelo SQL Editor, que
roda com privilégio de dono.

**Reversível:** `grant execute on function public.esquecer_participante(text) to authenticated;`

## Por que não movi para o esquema `private`

Seria mais elegante. Mas quebraria o comando documentado em
`PUBLICAR.md` — `select public.esquecer_participante('email@exemplo.com')`
— que é o que você vai usar sob pressão, no dia em que alguém pedir
exclusão. Revogar o privilégio resolve o mesmo risco sem invalidar a
documentação.

## O que continua apontado, de propósito

`acrescentar_meu_papel` e `remover_meu_papel` seguem chamáveis por conta
logada. **É assim que tem que ser**: é como um cliente vira tatuador
pelo botão da tela, sem passar por você.

Cada uma se protege sozinha:

- `acrescentar_meu_papel` recusa o papel `admin`. Sem isso, qualquer
  conta viraria administradora do próprio banco com uma chamada.
- `remover_meu_papel` recusa remover `client` e `admin`. Cliente é o
  piso: toda conta pode se tatuar.
- As duas exigem autenticação; a primeira é idempotente.

Se o aviso reaparecer no verificador daqui a seis meses, **ele é
esperado**. O verificador vê que a função é chamável; não vê o que tem
dentro dela.

## Antes e depois

| | `anon` | `authenticated` | `postgres` | `service_role` |
|---|---|---|---|---|
| Antes | — | **EXECUTE** | EXECUTE | EXECUTE |
| Depois | — | — | EXECUTE | EXECUTE |

Verificador de segurança: **4 avisos → 3**.
