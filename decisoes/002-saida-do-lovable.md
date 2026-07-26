# 002 — Sair do Lovable e adotar o protótipo como referência

**Data:** 26 de julho de 2026
**Situação:** decidido, em execução

## Contexto

O projeto nasceu no Lovable. O código exportado tem 8.675 linhas de interface e backend real para uma parte dos módulos, mas está acoplado à plataforma em seis pontos: configuração de build, login com Google, gateway de IA, gateway de geocodificação, relatório de erros e hospedagem.

Em paralelo, foi construído aqui um protótipo navegável que cobre as 19 rotas do produto com mais completude funcional que o código em vários pontos — filtros reais, onboarding do tatuador, perfil profundo, planos.

## Decisão

**Sair do Lovable**, com o protótipo navegável como referência de produto.

**Aproveitar do código original apenas o que supera recomeçar do zero.** O critério não é "já existe", é "custa mais reconstruir do que adaptar".

### Preservado

| O quê | Por quê |
|---|---|
| Schema e políticas de RLS | Dois meses de iteração, modelagem coerente, 16 migrações. Reconstruir seria desperdício. |
| Lógica de matching de orçamento | Regra de negócio não trivial: pontuação por estilo e cidade, convite ao artista alvo, limite de propostas. |
| Prompts de análise por IA | Conhecimento de domínio codificado — como ler uma referência e estimar preço e tempo. |
| Catálogo de estilos | 16 estilos com complexidade e faixa de hora-arte. Modelagem de domínio real. |
| Vocabulário de portfólio | Termos controlados que sustentam busca e matching. |

### Descartado

Toda a camada de aplicação React acoplada ao Lovable, as integrações proprietárias, os módulos que existiam só como interface sem backend, e os metadados da plataforma.

## Por quê

O argumento decisivo não é técnico, é de controle: hoje o pedaço mais defensável do produto — o orçamento por IA — roda através de um gateway de terceiro cujo preço não é visível nem negociável. Isso é dependência no caminho crítico do negócio, não só na infraestrutura.

O custo de sair também cresce com o tempo. Sair agora, com o produto ainda em protótipo e sem usuários reais, é a janela mais barata que vai existir.

## Consequências

**Perde-se:** preview e deploy de um clique, o ambiente sandbox, e a rede de segurança de "o Lovable conserta".

**Ganha-se:** controle de chaves e visibilidade do custo de IA, ambientes separados de verdade, histórico e reversão via GitHub, e a possibilidade de trabalhar direto no código versionado em vez de trocar arquivos compactados.

**Não se perde:** código, dados, migrações, RLS, storage, nem o desenho do produto.

## Risco residual

O único ponto com risco real de perda é a titularidade do projeto Supabase — o Lovable Cloud provisiona esses projetos e o dono pode ser a plataforma. Está registrado como P0 em `pendencias.md` e precisa ser verificado antes de qualquer outra coisa.

O segundo risco, menor mas traiçoeiro, é a reconstrução do build: `@lovable.dev/vite-tanstack-config` esconde a configuração inteira do Vite, e erro ali não produz falha óbvia, produz falha sutil de SSR ou React duplicado.

## Onde ver

Plano completo com inventário de acoplamento e código de substituição: `documentos/05-saida-do-lovable.md`
