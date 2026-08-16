# lovable.backup — encerrado

**O projeto não depende mais do Lovable.** Esta pasta guarda o que
sobrou daquela fase, só para consulta. Nada aqui é executado, importado
ou referenciado pelo produto.

Auditoria de 16 de agosto de 2026 (`../DESACOPLAMENTO.md`):

- zero menções ao Lovable no código que roda
- sem `package.json`, sem build, sem `@lovable.dev/vite-tanstack-config`
- o banco está na organização `norbgt`, sua
- duas dependências em tempo de execução: o seu Supabase e o `esm.sh`

---

## O que está aqui

**`05-saida-do-lovable.md`** — o plano de desacoplamento, com inventário
de acoplamento e código de substituição. Foi executado. Fica como
registro de como a saída foi feita, e porque ele descreve integrações
que talvez você queira reconstruir um dia por conta própria (login com
Google, geocodificação, análise de imagem).

---

## O projeto Supabase antigo

`xfiilquqnqgfjzmlasyx` — **não aparece na sua conta.** Ou foi apagado,
ou pertence a uma organização que não é sua.

Ele guardava testes do período de protótipo. O banco em uso hoje é outro
(`hdfigxygektppvlogaoj`), criado por você em 26/07/2026, e não tem
relação com aquele.

**Pendência de dez minutos, e depois esquecer:** entrar no Lovable, ver
se o projeto ainda existe e se há algum dado que importe. Se não houver,
o assunto está encerrado — e se houver, o acesso só fica mais difícil
com o tempo.

---

## O que NÃO veio para cá, e por quê

**`decisoes/002-saida-do-lovable.md`** ficou onde estava. É um registro
de decisão, e um log de decisões com buracos deixa de ser log — daqui a
um ano, a pergunta "por que saímos do Lovable?" precisa ter resposta na
sequência numerada, não numa pasta de arquivo morto.

**`banco/`** é o esquema e as migrações do seu banco atual. Nasceu
naquele período, mas é SQL puro, padrão Postgres, e descreve a base que
está no ar hoje. É documentação viva.

**`dominio/`** são prompts, vocabulário de portfólio, catálogo de
estilos e a lógica de matching. São seus, e a única parte com
acoplamento — o provedor de IA — já foi isolada num arquivo só.
