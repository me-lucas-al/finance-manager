# Finance Manager

Aplicativo web e assistente financeiro pessoal integrado ao **Telegram**, focado em lançamentos rápidos, acompanhamento orçamentário e consultoria financeira proativa com **IA (Google Gemini 2.5)**.

---

## 🚀 Principais Funcionalidades

### 1. Lançamentos Manuais Ágeis via Telegram
Registre movimentações financeiras instantaneamente pelo chat do bot, sem abrir telas ou menus:
- **Despesas**: `almoço 35`, `-50 uber`, `mercado 120,50`
- **Receitas**: `salario 5000`, `recebi 1500 freela`
- **Investimentos**: `inv 500 cdb`, `investi 200 ações petr4`
- **Fallback Inteligente**: Se você digitar em linguagem natural (ex: *"comprei um fone bluetooth de 180 reais no mercado livre"*), o Gemini Flash extrai os dados estruturados automaticamente ou pede esclarecimentos se faltar informação.

### 2. Comandos do Bot
- `/saldo`: Exibe o saldo bancário líquido, total de faturas e carteira de investimentos atual.
- `/resumo`: Consolida o fechamento do mês atual ou anterior (entradas, saídas, taxa de poupança e top categorias).
- `/desfazer`: Cancela e exclui o último lançamento manual efetuado.
- `/goal`: Configura ou consulta metas orçamentárias mensais por categoria.
- `/ajuda`: Lista de comandos e exemplos de mensagens.

### 3. Consultoria Financeira com IA (Gemini 2.5)
Pergunte qualquer coisa sobre suas finanças diretamente no Telegram. O assistente possui:
- **Chamada de Ferramentas (Tool Calling)**:
  - `buscar_lancamentos`: Histórico recente de despesas por período ou categoria.
  - `total_por_categoria`: Consolidação de gastos no mês.
  - `comparar_periodos`: Análise comparativa entre dois meses (ex: `2026-09` vs `2026-10`).
  - `registrar_lancamento`: Criação de registros via comandos conversacionais.
  - `definir_limite_categoria`: Ajuste de metas orçamentárias diretamente pelo chat.
  - `salvar_memoria`: Registro de fatos e planos pessoais de longo prazo (ex: *"planejo viajar em dezembro"*).
- **Memória Deslizante**: Mantém as últimas 12 mensagens em janela ativa com sumarização automática para contextos longos.
- **Detecção Proativa de Padrões**:
  - Alerta de pequenos gastos frequentes em uma mesma categoria ("gotejamento financeiro").
  - Identificação de picos atípicos (gastos superiores ao dobro da média histórica).
  - Reconhecimento de potenciais assinaturas não cadastradas.
  - Aviso preventivo ao atingir 80% ou mais do teto orçamentário mensal da categoria.

### 4. Dashboard Web & PWA
- Painel visual completo com gráficos de evolução de patrimônio, despesas por categoria e acompanhamento de períodos.
- Progressive Web App (PWA) instalável em dispositivos móveis e desktops, com suporte a Web Push Notifications.

---

## 🛠️ Stack Tecnológica

- **Frontend & Backend**: Next.js 16 (App Router, Server Actions, `after()` API)
- **Linguagem**: TypeScript (Strict Mode)
- **Estilização**: Tailwind CSS v4 & shadcn/ui
- **Banco de Dados**: Neon (Serverless Postgres) & Supabase
- **ORM & Migrations**: Drizzle ORM & Supabase Migrations
- **Inteligência Artificial**: Vercel AI SDK (`ai` v7) & Google Gemini (`gemini-3.6-flash`, `gemini-3.1-pro-preview`)
- **Mensageria**: Telegram Bot API (Webhook serverless com idempotência)
- **Testes**: Vitest (Unitários/Integração) & Playwright (E2E)

---

## 📦 Instalação e Execução Local

### Pré-requisitos
- Node.js 20+
- pnpm instalado globalmente (`npm install -g pnpm`)

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/me-lucas-al/finance-manager.git
cd finance-manager
pnpm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha suas credenciais:
```bash
cp .env.example .env
```

Campos essenciais:
```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@hostname/dbname
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Autenticação & App
AUTH_SECRET=sua_chave_nextauth
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Telegram Bot
TELEGRAM_BOT_TOKEN=seu_bot_token_aqui
TELEGRAM_ALLOWED_CHAT_ID=seu_chat_id_aqui
TELEGRAM_WEBHOOK_SECRET=token_secreto_webhook_opcional

# Google Gemini AI
GEMINI_API_KEY=sua_gemini_api_key

# Notificações Web Push (VAPID)
PUSH_PUBLIC_KEY=sua_chave_publica_vapid
PUSH_PRIVATE_KEY=sua_chave_privada_vapid
PUSH_SUBJECT=mailto:seu_email@dominio.com
```

### 3. Migrações do Banco de Dados
```bash
pnpm run db:generate
pnpm run db:migrate
```

### 4. Executar em Desenvolvimento
```bash
pnpm run dev
```
Acesse o aplicativo em [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testes e Qualidade de Código

O repositório adota padrões rigorosos de qualidade (SOLID, Clean Code, arquivos com no máximo 100 linhas e zero comentários no código-fonte).

- **Verificação de Tipos**:
  ```bash
  pnpm run typecheck
  ```
- **Linter**:
  ```bash
  pnpm run lint
  ```
- **Testes Unitários e Integração (Vitest)**:
  ```bash
  pnpm run test
  ```
- **Testes End-to-End (Playwright)**:
  ```bash
  pnpm run test:e2e
  ```

---

## 🚀 Deploy

O projeto está configurado para deploy contínuo na [Vercel](https://vercel.com).
O webhook do Telegram aponta para a rota pública:
```
POST https://seu-dominio.vercel.app/api/telegram-webhook
```
*(Com cabeçalho de validação `x-telegram-bot-api-secret-token` correspondente à variável `TELEGRAM_WEBHOOK_SECRET`).*
