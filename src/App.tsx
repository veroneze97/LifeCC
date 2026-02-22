import { useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FilterProvider } from './contexts/FilterContext'
import { AppRoutes } from './routes'
import { checkIfDatabaseEmpty, seedDatabase } from './services/seed'

function App() {
    useEffect(() => {
        async function initSeed() {
            try {
                const isEmpty = await checkIfDatabaseEmpty()
                if (isEmpty) {
                    console.log('Database empty, performing auto-seed...')
                    await seedDatabase()
                    // Em vez de recarregar a página cegamente, exibe um alerta ou apenas confia no fetch
                    console.log('Seed completo. Se os dados não aparecerem, recarregue a página manualmente.')
                }
            } catch (error) {
                console.error('Erro ao verificar ou realizar o seed do banco de dados. Verifique as credenciais do Supabase no .env', error)
            }
        }
        initSeed()
    }, [])

    return (
        <HashRouter>
            <AuthProvider>
                <FilterProvider>
                    <AppRoutes />
                </FilterProvider>
            </AuthProvider>
        </HashRouter>
    )
}

export default App
