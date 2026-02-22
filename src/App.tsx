import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FilterProvider } from './contexts/FilterContext'
import { AppRoutes } from './routes'

function App() {
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
