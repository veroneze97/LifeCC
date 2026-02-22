# GO/NO-GO Checklist — Supabase Production Release

> Scope: `profiles`, `accounts`, `transactions`, `shifts`, `assets`, `liabilities`, `health_metrics`, `goals`.

## 0) Migration order (strict)
1. `supabase/migrations/001_base.sql`
2. `supabase/migrations/002_add_profile_id.sql`
3. `supabase/migrations/003_rls.sql`
4. `supabase/migrations/004_seed_dev.sql` (optional, dev only)

---

## 1) Bloco 1 — Pré-check (antes de rodar migrations)

### 1.1 Listar tabelas existentes (public)
```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

### 1.2 Confirmar quais tabelas têm coluna `user_id`
```sql
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and table_name in ('accounts','transactions','shifts','assets','liabilities','health_metrics','goals')
  and column_name = 'user_id'
order by table_name;
```

### 1.3 Detectar linhas com `user_id` não-UUID (NO-GO)
> Observação: a query abaixo cobre apenas tabelas que historicamente usam `user_id`.
```sql
with cte as (
  select 'accounts' as table_name, count(*) as non_uuid_rows
  from public.accounts
  where user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'

  union all
  select 'transactions', count(*)
  from public.transactions
  where user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'

  union all
  select 'shifts', count(*)
  from public.shifts
  where user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'

  union all
  select 'assets', count(*)
  from public.assets
  where user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'

  union all
  select 'liabilities', count(*)
  from public.liabilities
  where user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'

  union all
  select 'health_metrics', count(*)
  from public.health_metrics
  where user_id is null or user_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
)
select * from cte where non_uuid_rows > 0 order by table_name;
```

### 1.4 Contar linhas por tabela (baseline)
```sql
select 'profiles' as table_name, count(*) as rows from public.profiles
union all select 'accounts', count(*) from public.accounts
union all select 'transactions', count(*) from public.transactions
union all select 'shifts', count(*) from public.shifts
union all select 'assets', count(*) from public.assets
union all select 'liabilities', count(*) from public.liabilities
union all select 'health_metrics', count(*) from public.health_metrics
union all select 'goals', count(*) from public.goals
order by table_name;
```

---

## 2) Bloco 2 — Pós-migration (schema + constraints)

### 2.1 Confirmar `profile_id` existe e está `NOT NULL`
```sql
select
  c.table_name,
  max(case when c.column_name = 'profile_id' then 'YES' else 'NO' end) as has_profile_id,
  max(case when c.column_name = 'profile_id' then c.is_nullable else null end) as profile_id_is_nullable
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name in ('accounts','transactions','shifts','assets','liabilities','health_metrics','goals')
group by c.table_name
order by c.table_name;
```

### 2.2 Listar FKs envolvendo `profile_id`
```sql
select
  tc.table_name,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name,
  tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and kcu.column_name = 'profile_id'
order by tc.table_name, tc.constraint_name;
```

### 2.3 Confirmar índices de `profile_id`
```sql
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and (
    indexname like 'idx_%_profile_id'
    or indexdef ilike '%(profile_id)%'
  )
order by tablename, indexname;
```

---

## 3) Bloco 3 — Segurança (RLS + policies)

### 3.1 Confirmar RLS habilitado
```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','accounts','transactions','shifts','assets','liabilities','health_metrics','goals')
order by tablename;
```

### 3.2 Listar policies por tabela (cmd + qual + with_check)
```sql
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','accounts','transactions','shifts','assets','liabilities','health_metrics','goals')
order by tablename, cmd, policyname;
```

### 3.3 Provar que não existe tabela do escopo sem policy
```sql
with scoped_tables as (
  select unnest(array['profiles','accounts','transactions','shifts','assets','liabilities','health_metrics','goals']) as table_name
),
policy_counts as (
  select tablename as table_name, count(*) as policies
  from pg_policies
  where schemaname = 'public'
    and tablename in (select table_name from scoped_tables)
  group by tablename
)
select s.table_name, coalesce(p.policies, 0) as policies
from scoped_tables s
left join policy_counts p on p.table_name = s.table_name
where coalesce(p.policies, 0) = 0
order by s.table_name;
```

### 3.4 Auditoria de GRANTS (anon/authenticated)
```sql
select
  grantee,
  table_schema,
  table_name,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles','accounts','transactions','shifts','assets','liabilities','health_metrics','goals')
  and grantee in ('anon', 'authenticated')
order by grantee, table_name, privilege_type;
```

---

## 4) End-to-end multiusuário (aprovação final)

### 4.1 Criar usuário A e B
- Criar dois usuários no Supabase Auth (Dashboard > Authentication > Users).
- Obter credenciais (email/senha) de ambos.

### 4.2 Login A no app e criar dados
- Login como A.
- Criar 1 conta e 1 transação no app.
- Guarde:
  - `UID_A`
  - `JWT_A`
  - `TX_ID_A`

### 4.3 Confirmar SQL para A
```sql
select id, profile_id, name, created_at
from public.accounts
where profile_id = '<UID_A>';

select id, profile_id, account_id, amount, description, created_at
from public.transactions
where id = '<TX_ID_A>';
```

### 4.4 Login B e validar isolamento no app
- Logout A.
- Login B.
- Esperado: B não vê a conta/transação de A.
- Guarde `JWT_B`.

### 4.5 Teste Postman (token B tentando acessar registro de A)

#### GET transação de A com JWT_B
`GET https://<PROJECT_REF>.supabase.co/rest/v1/transactions?id=eq.<TX_ID_A>&select=*`

Headers:
- `apikey: <SUPABASE_ANON_KEY>`
- `Authorization: Bearer <JWT_B>`

Esperado:
- HTTP 200
- Body `[]`

#### PATCH transação de A com JWT_B
`PATCH https://<PROJECT_REF>.supabase.co/rest/v1/transactions?id=eq.<TX_ID_A>`

Headers:
- `apikey: <SUPABASE_ANON_KEY>`
- `Authorization: Bearer <JWT_B>`
- `Content-Type: application/json`
- `Prefer: return=representation`

Body:
```json
{"description":"attempted hijack"}
```

Esperado:
- HTTP 200
- Body `[]` (0 rows atualizadas)

#### DELETE transação de A com JWT_B
`DELETE https://<PROJECT_REF>.supabase.co/rest/v1/transactions?id=eq.<TX_ID_A>`

Headers:
- `apikey: <SUPABASE_ANON_KEY>`
- `Authorization: Bearer <JWT_B>`
- `Prefer: return=representation`

Esperado:
- HTTP 200
- Body `[]` (0 rows removidas)

### 4.6 Prova de integridade: consultar com JWT_A após tentativas de B

#### GET transação de A com JWT_A
`GET https://<PROJECT_REF>.supabase.co/rest/v1/transactions?id=eq.<TX_ID_A>&select=id,description,profile_id`

Headers:
- `apikey: <SUPABASE_ANON_KEY>`
- `Authorization: Bearer <JWT_A>`

Esperado:
- HTTP 200
- Body com 1 linha
- `description` igual ao valor original (não alterado por B)
- `profile_id = UID_A`

---

## 5) Critério objetivo de GO/NO-GO

### GO (somente se todos passarem)
- Migrations 001–003 rodam sem erro.
- `profile_id` existe e `NOT NULL` nas tabelas alvo.
- FKs de `profile_id` presentes e válidas.
- RLS = `true` em todas as tabelas do escopo.
- Policies CRUD presentes em todas as tabelas do escopo.
- Teste A/B de isolamento passa (app + Postman).
- Frontend inicia em PROD com env correta, sem fallback mock.

### NO-GO
- Qualquer item acima falhar.
- Ação corretiva: corrigir migração/policy/env e repetir os 3 blocos de validação + E2E.
