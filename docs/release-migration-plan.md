# Release / Migration Production Plan (Supabase)

## 1) Auditoria de aderência ao código

### Tabelas e colunas referenciadas no app
- `profiles`: `id`, `name`, `role`, `created_at`.
- `accounts`: `id`, `profile_id`, `name`, `type`, `balance_initial`, `created_at`.
- `transactions`: `id`, `profile_id`, `account_id`, `date`, `type`, `category`, `description`, `amount`, `status`, `source`, `created_at`.
- `shifts`: `id`, `profile_id`, `date`, `place`, `specialty`, `value_expected`, `value_received`, `status`, `payment_due_date`, `notes`, `created_at`.
- `assets`: `id`, `profile_id`, `type`, `name`, `value`, `date_reference`, `created_at`.
- `liabilities`: `id`, `profile_id`, `type`, `name`, `value`, `date_reference`, `created_at`.
- `health_metrics`: `id`, `profile_id`, `date`, `weight`, `workouts`, `steps`, `notes`, `created_at`.
- `goals`: `id`, `profile_id`, `name`, `target_value`, `target_date`, `monthly_contribution`, `expected_return_rate`, `scope`, `created_at`.

### O que faltava no schema legado
- Tabela `profiles` não existia no SQL legado.
- Tabela `goals` não existia no SQL legado.
- `profile_id` não estava presente em todas as tabelas de domínio usadas pelo app.
- Não havia RLS/policies cobrindo todas as tabelas de negócio.
- Não havia padronização de `updated_at` com trigger de toque em update.

### Divergências detectadas
- O app original usava `user_id = 'local'` em queries e payloads.
- O modelo de produção usa `profile_id = auth.uid()` como ownership canônico.
- `goals.profile_id` agora é obrigatório para consistência de ownership e RLS.
- Backfill de `user_id` legado foi definido em modo seguro fail-fast (NO-GO em `user_id` não-UUID).

## 2) Ordem rígida de migrations
1. `001_base.sql`
2. `002_add_profile_id.sql`
3. `003_rls.sql`
4. `004_seed_dev.sql` (somente ambiente dev)

## 3) Regras RLS mínimas
- Tabelas cobertas: `accounts`, `transactions`, `shifts`, `assets`, `liabilities`, `health_metrics`, `goals`, `profiles`.
- Policies separadas por operação (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- Regra base: `auth.uid() = profile_id` (ou `auth.uid() = profiles.id` na tabela de perfis).

## 4) Runtime frontend
- Fail-fast em produção para variáveis ausentes/placeholder.
- Sem fallback mock em produção.
- Frontend depende apenas de:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 5) Checklist pós-migration
- Login realizado com usuário Supabase válido.
- CRUD básico ok em todas as tabelas de negócio com usuário logado.
- Seed dev executa sem erro com `app.seed_profile_id` definido.
- Páginas principais carregam sem erro de tabela/coluna ausente.
- RLS bloqueia acesso cruzado entre usuários distintos.
