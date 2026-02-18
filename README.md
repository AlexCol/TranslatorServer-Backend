# Backend - Translator Server

API para catalogos de traducao por `sistema`, `ambiente`, `idioma` e `namespace`.

## Stack
- NestJS 11
- Fastify
- TypeScript
- Knex
- SQLite
- class-validator / class-transformer
- Swagger + Scalar

## Requisitos
- Node.js 20+
- npm 10+

## Como rodar
1. Instale dependencias
```bash
npm install
```

2. Configure variaveis
```bash
cp ".env copy" .env
```

3. Rode migracoes
```bash
npm run migrate:all
```

4. Inicie em desenvolvimento
```bash
npm run dev
```

Servidor padrao: `http://localhost:3000`

## Variaveis de ambiente principais
Arquivo base: `.env copy`.

- `NODE_ENV`: `development | production | test`
- `PORT`: porta da API (default 3000)
- `AUTH_PROVIDER`: `mock | redmine`
- `SESSION_TTL`: TTL de sessao em segundos
- `COOKIE_SECRET`: obrigatorio em producao
- `REDMINE_URL`: necessario se `AUTH_PROVIDER=redmine`
- `TRANSLATIONS_PROVIDER`: provider de traducoes (atual `database`)
- `TRANSLATIONS_CACHE_TTL`: TTL de cache de traducoes
- `ALLOWED_ORIGINS`: origens permitidas para CORS
- `CDN_PROVIDER`: `filesystem | bunny`
- `BUNNY_KEY`, `BUNNY_STORAGE_NAME`, `BUNNY_TRANSLATIONS_PATH`: config do Bunny
- `FILESYSTEM_BASE_PATH`: base de escrita para provider local de CDN

## Scripts
- `npm run dev`: aplica migracoes e sobe em watch
- `npm run debug`: sobe em debug + watch
- `npm run build`: build de producao
- `npm run prod`: executa `dist/main`
- `npm run lint`: lint + fix
- `npm run format`: prettier
- `npm run migrate:c`: cria migration
- `npm run migrate:all`: aplica migrations pendentes

## Endpoints e docs
- Prefixo global: `/api`
- Health: `GET /api`
- Docs interativas: `/api/docs`
- OpenAPI JSON: `/swagger/json`
- OpenAPI YAML: `/swagger/yaml`

## Modulos principais
- `auth`: autenticacao e sessao
- `session`: gerencia ciclo de vida de sessao
- `core-translations`: sistema/ambiente/idioma/namespace/traducoes/publicacao
- `cdn-publisher`: push para CDN
- `infra`: banco, cache e adaptadores

## Observacoes
- Em producao, `AUTH_PROVIDER=mock` e bloqueado.
- O fluxo de edicao normalmente acontece no ambiente configurado como desenvolvimento no frontend.
