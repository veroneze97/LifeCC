# LifeCC - Documentação Técnica Interna

## Visão Geral
LifeCC é um ecossistema de gestão financeira e saúde focado em performance e alta estética (Premium Look & Feel). O projeto foi construído com foco em escalabilidade, manutenibilidade e experiência do usuário fluida.

## Stack Tecnológica
- **Frontend**: React (Vite) + TypeScript
- **Estilização**: Tailwind CSS (Glassmorphism, Dark Mode)
- **Ícones**: Lucide React
- **Banco de Dados & Auth**: Supabase
- **Data/Hora**: date-fns

## Padrões de Código (Standardization)

### 1. Nomenclatura
- **Componentes**: PascalCase (ex: `DashboardPage.tsx`, `TransactionForm.tsx`)
- **Arquivos de utilitários/hooks**: camelCase (ex: `useDashboardData.ts`, `financialCalculations.ts`)
- **Variáveis e Funções**: camelCase (ex: `selectedProfileId`, `calculateTotalBalance`)
- **Interfaces e Tipos**: PascalCase (ex: `TransactionPayload`, `ProfileParticipation`)

### 2. Organização de Imports
Siga sempre esta ordem para manter a legibilidade:
1. React / Hooks do React
2. Bibliotecas externas e hooks de terceiros (Lucide, date-fns, router)
3. Serviços e Configurações (Supabase)
4. Contextos e Context Hooks
5. Componentes internos
6. Utilitários e Helpers

### 3. Design System (Premium Aesthetic)
- **Cores**: Preferência por tons de cinza (`zinc-50` a `zinc-950`), branco puro e contrastes profundos.
- **Formas**: Bordas arredondadas generosas (`rounded-2xl`, `rounded-[2rem]`).
- **Efeitos**: Glassmorphism (`backdrop-blur-md`, `bg-white/10`), sombras suaves (`shadow-xl shadow-zinc-950/20`) e micro-animações (`animate-in`, `active:scale-95`).

## Estrutura de Pastas Úteis
- `/src/components`: Componentes reutilizáveis e formulários.
- `/src/contexts`: Provedores de estado global (Filtros, Auth).
- `/src/hooks`: Lógica de dados abstraída (ex: `useDashboardData`).
- `/src/pages`: Páginas principais da aplicação.
- `/src/utils`: Funções puras de cálculo e formatação.

## Considerações para Futuras Implementações
- **Cálculos**: Sempre use os utilitários centralizados em `/src/utils` para garantir consistência de dados entre o Dashboard e o Relatório.
- **Performance**: Utilize `useMemo` e `useCallback` em componentes pesados (como o Dashboard) para evitar re-renders desnecessários.
- **Tratamento de Erros**: Todos os formulários devem ter um estado de erro visível para o usuário e logs silenciosos para o desenvolvedor.

---
*LifeCC - Standardized & Optimized for Excellence*
