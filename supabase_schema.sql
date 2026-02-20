-- Remover tabelas antigas se existirem para garantir o estado limpo solicitado
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS liabilities CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;

-- Tabela: accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local',
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checking', 'cash', 'credit', 'investment')),
    balance_initial NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local',
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: shifts
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local',
    date DATE NOT NULL,
    place TEXT NOT NULL,
    specialty TEXT,
    value_expected NUMERIC NOT NULL,
    value_received NUMERIC,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'done', 'invoiced', 'paid')),
    payment_due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local',
    type TEXT NOT NULL CHECK (type IN ('cash', 'investment', 'property', 'vehicle', 'other')),
    name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    date_reference DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: liabilities
CREATE TABLE liabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local',
    type TEXT NOT NULL CHECK (type IN ('loan', 'credit_card', 'financing', 'other')),
    name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    date_reference DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: health_metrics
CREATE TABLE health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'local',
    date DATE NOT NULL,
    weight NUMERIC,
    workouts INTEGER DEFAULT 0,
    steps INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
