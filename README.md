# LifeCC — Alpha Executive Dashboard

## 📌 Visão Geral
O LifeCC é uma plataforma de inteligência financeira e performance pessoal projetada para consolidar patrimônio, gerenciar fluxos de caixa e monitorar o progresso em direção a metas estratégicas. O sistema suporta o **Modo Casal**, permitindo a gestão conjunta ou individual de perfis.

## 🔐 Autenticação (Supabase Auth)
O app agora funciona como SaaS multiusuário:
- Login por e-mail/senha
- Cadastro por e-mail/senha
- Login/Cadastro com Google OAuth
- Sessão persistente via Supabase
- Rotas privadas protegidas (`/dashboard`, `/cashflow`, `/shifts`, `/networth`, `/performance`, `/settings`, `/report`)

## 🏗️ Estrutura do Projeto
A arquitetura segue uma separação clara de responsabilidades:

- **`/src/components`**: Componentes de interface e formulários de entrada.
- **`/src/contexts`**: Gerenciamento de estado compartilhado (ex: filtros de data e perfil).
- **`/src/hooks`**: Hooks customizados para orquestração de dados e integração com Supabase.
- **`/src/pages`**: Views principais da aplicação (Dashboard, Configurações, Relatórios).
- **`/src/services`**: Configurações de serviços externos e scripts de banco de dados.
- **`/src/utils`**: Funções utilitárias puras para cálculos matemáticos e formatação.

## ⚙️ Variáveis de Ambiente
Crie um arquivo `.env` (ou `.env.local`) com:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

O app não usa mais fallback de credenciais hardcoded.

## 🟢 Configurar Google Provider no Supabase
1. No Supabase Dashboard, abra `Authentication > Providers > Google`.
2. Ative o provider Google.
3. Configure `Client ID` e `Client Secret` do Google Cloud.
4. Em `Authentication > URL Configuration`, adicione os Redirect URLs:
   - Dev: `http://localhost:5173`
   - Dev (codespaces/preview, se aplicável): `https://SEU-DOMINIO-DE-DEV`
   - Prod: `https://SEU-DOMINIO-DE-PRODUCAO`
5. Em Google Cloud Console, adicione os mesmos URLs em `Authorized redirect URIs` e `Authorized JavaScript origins`.

Observação: o projeto usa `HashRouter`, mas o callback OAuth deve apontar para a raiz do domínio (sem `#/...`).

## 🤖 Edge Function: classify-transactions
Função serverless para classificar e limpar descrições de transações usando IA de baixo custo (sem gravar no banco nesta etapa).

Entrada (`POST` JSON):

```json
{
  "rows": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": 123.45,
      "type": "income"
    }
  ],
  "categories": ["Moradia", "Alimentação", "Outros"]
}
```

Saída:

```json
{
  "rows": [
    {
      "cleanDescription": "string",
      "category": "Moradia",
      "confidence": 82
    }
  ]
}
```

Regras:
- A categoria retornada sempre é forçada para uma das categorias informadas na requisição.
- Se a função/LLM ficar incerta, ela usa `Outros` com baixa confiança.
- Para fallback consistente, inclua `Outros` no array `categories`.

### Variável de ambiente da função
Defina o segredo no projeto Supabase:

```bash
supabase secrets set OPENAI_API_KEY=sk-xxxx
```

### Deploy da Edge Function

```bash
supabase functions deploy classify-transactions
```

Opcional (rodar localmente):

```bash
supabase functions serve classify-transactions --env-file ./supabase/.env.local
```

## 🗃️ Banco de Dados e RLS
- Todas as tabelas de negócio usam `user_id uuid` e isolamento por `auth.uid()`.
- `profiles` pertence ao usuário autenticado via `profiles.user_id`.
- Tabelas com `profile_id` validam que o perfil pertence ao mesmo `user_id`.
- Migração principal de hardening multiusuário: `supabase/migrations/005_auth_user_scope.sql`.

Migrações relevantes:
- `001_base.sql`
- `002_add_profile_id.sql`
- `003_rls.sql`
- `005_auth_user_scope.sql` (modelo SaaS final)

Após autenticação, o app garante bootstrap do usuário:
- cria profile primário automaticamente se não existir
- cria conta default "Conta Principal" se não houver contas

## 🧪 Fórmulas e Inteligência de Negócio

### 1. Life Score Alpha (0-100)
O Life Score é o indicador proprietário de performance global, composto por três pilares:
- **Financeiro (60%)**: Pontuação progressiva baseada na *Taxa de Investimento*. O benchmark de excelência é 30% da receita.
- **Patrimônio (25%)**: Avalia o crescimento real do Net Worth mês a mês. O benchmark de excelência é um crescimento >= 2%.
- **Performance (15%)**: Consistência de saúde baseada em treinos mensais. O benchmark é de 12 treinos por mês.

### 2. Projeções de Metas
- **Progresso**: `(Net Worth Atual / Valor Alvo da Meta) * 100`
- **Tempo Estimado**: `(Valor Alvo - Net Worth Atual) / Aporte Mensal Planejado`

## 🔄 Fluxo de Dados
1. **Filtros**: O `FilterContext` gerencia o mês de referência e o perfil selecionado.
2. **Coleta**: O hook `useDashboardData` escuta os filtros e busca dados brutos no Supabase.
3. **Processamento**: Os dados brutos são processados pelos utilitários (`calculateNetWorth`, `calculateLifeScore`, etc.) usando `useMemo` para garantir performance.
4. **Exibição**: Componentes puramente declarativos renderizam as métricas processadas.

## 🛠️ Padronização Técnica
- **Nomenclatura**:
  - `camelCase` para variáveis, funções e propriedades.
  - `PascalCase` para componentes React e interfaces.
- **Estilo**: Tailwind CSS com design system focado em glassmorphism e estética premium.
- **Segurança**: Todas as queries ao banco de dados são escopadas por `user_id = auth.uid()` + políticas RLS.
