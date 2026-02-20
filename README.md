# LifeCC — Alpha Executive Dashboard

## 📌 Visão Geral
O LifeCC é uma plataforma de inteligência financeira e performance pessoal projetada para consolidar patrimônio, gerenciar fluxos de caixa e monitorar o progresso em direção a metas estratégicas. O sistema suporta o **Modo Casal**, permitindo a gestão conjunta ou individual de perfis.

## 🏗️ Estrutura do Projeto
A arquitetura segue uma separação clara de responsabilidades:

- **`/src/components`**: Componentes de interface e formulários de entrada.
- **`/src/contexts`**: Gerenciamento de estado compartilhado (ex: filtros de data e perfil).
- **`/src/hooks`**: Hooks customizados para orquestração de dados e integração com Supabase.
- **`/src/pages`**: Views principais da aplicação (Dashboard, Configurações, Relatórios).
- **`/src/services`**: Configurações de serviços externos e scripts de banco de dados.
- **`/src/utils`**: Funções utilitárias puras para cálculos matemáticos e formatação.

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
- **Segurança**: Todas as queries ao banco de dados devem ser filtradas por `user_id = 'local'`.
