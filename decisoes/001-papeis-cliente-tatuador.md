# 001 — Papéis de cliente e tatuador

**Data:** 26 de julho de 2026
**Situação:** decidido, implementação pendente

## Contexto

O schema define um enum `app_role` (admin/artist/client) e uma tabela `user_roles` com função `has_role()`, mas isso só era usado nas políticas de admin. A diferenciação real entre cliente e tatuador acontecia por convenção: se existe uma linha em `artists` para aquele `profile_id`, a pessoa é tratada como tatuadora.

Consequência: qualquer usuário autenticado virava tatuador simplesmente acessando `/studio`, sem escolha explícita em lugar nenhum. E `performSaveArtist` não verificava papel algum antes de criar o perfil profissional.

## Decisão

**A pergunta "você também é tatuador?" é obrigatória no primeiro momento da conta**, sem opção pré-selecionada. Nenhuma das duas alternativas vem marcada; o botão de continuar fica desabilitado até haver clique explícito.

**Papéis não são excludentes.** Todo mundo é cliente. Tatuador é uma capacidade adicional, nunca substitutiva — um tatuador continua podendo se tatuar, comprar na loja, fazer cursos e ir a eventos.

**Quem responde "não" pode mudar de ideia depois**, por um banner dentro da área do cliente. O upgrade só acrescenta uma linha em `user_roles`; nada é removido.

**Contas anteriores a esta mudança ficam fora.** Sem migração retroativa.

**A origem do papel é registrada** na coluna `source`: `signup_trigger`, `role_select_gate` ou `upgrade`. Não bloqueia nada — é rastro para produto e suporte.

## Por quê

A alternativa era formalizar a convenção atual (existência de linha em `artists` define o papel). Foi descartada porque:

- Deixa a autorização implícita num efeito colateral, não numa afirmação
- Torna impossível distinguir "quis ser tatuador e não completou o cadastro" de "nunca quis"
- Não tem como bloquear acesso indevido: sem papel declarado, não há o que verificar

Papéis aditivos, em vez de exclusivos, refletem o comportamento real do mercado: tatuadores são clientes de outros tatuadores, compram material e fazem cursos. Um modelo exclusivo criaria a necessidade absurda de duas contas para a mesma pessoa.

## Consequências

O login por Google não passa pelo formulário de cadastro, então não carrega a resposta. A obrigatoriedade real precisa de um guard na aplicação: sessão autenticada sem nenhuma linha em `user_roles` é desviada para uma tela de escolha antes de acessar qualquer rota. O trigger no banco é apenas a otimização que evita esse desvio no caminho comum.

O guard de `/studio` muda de comportamento: sem papel de tatuador, redireciona para `/me` em vez de empurrar para o onboarding. E `performSaveArtist` passa a verificar `has_role(userId, 'artist')` antes de gravar — fechando a brecha atual.

A coluna `profiles.role` deixa de ser fonte de verdade, mas não é removida agora.

## Onde ver

- Migração: `banco/correcoes/18_modelo_de_papeis.sql`
- Proposta detalhada com código: `documentos/02-proposta-papeis.md`
- Protótipo: abra `prototipo/index.html`, crie conta e observe a escolha obrigatória; entre como cliente e veja o banner de upgrade; tente abrir o ambiente do tatuador sem o papel
