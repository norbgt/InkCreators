# Ink Creators

Plataforma que conecta pessoas que querem se tatuar a tatuadores, estúdios e arte — descobrir, orçar, marcar, comprar e voltar, no mesmo lugar.

Este repositório é a fonte de verdade do projeto.

**© 2026 Amanda Noronha. Todos os direitos reservados.**
Os direitos autorais desta plataforma — conceito, produto, interface e
textos — são de [Amanda Noronha](https://www.linkedin.com/in/amanda-noronha/).

## Estrutura

```
prototipo/     Protótipo navegável — a especificação viva da interface
banco/         Schema, políticas de segurança e migrações do Postgres
dominio/       Regras de negócio que valem preservar (catálogo, prompts, matching)
decisoes/      Registro das decisões tomadas e por quê
documentos/    Análises e planos
```

## Como usar o protótipo

Abra `prototipo/index.html` em qualquer navegador. Não precisa de servidor nem de build.

Ele cobre as 19 telas do produto, alterna entre visitante, cliente e tatuador pela barra superior, e tem tema claro e escuro. É onde decisões de produto ficam visíveis antes de custar código.

## Estado atual

Isto é um protótipo com fundação parcial, não um produto em operação.

**Funciona contra banco real:** cadastro e login, perfil de tatuador, portfólio, catálogo público, e o fluxo de orçamento com IA e matching por estilo e cidade.

**Existe só como interface:** loja, chat, agenda, eventos, campanhas, avaliações, pagamentos e planos de assinatura.

Ver `documentos/` para o diagnóstico completo.

## Segurança

Segredos nunca entram neste repositório. O `.gitignore` bloqueia `.env` e derivados; use `.env.exemplo` como referência dos nomes de variáveis, sem valores.

Backups de banco também ficam fora — podem conter dados pessoais de usuários reais.

## Pendências que dependem de decisão

Ver `decisoes/pendencias.md`.
