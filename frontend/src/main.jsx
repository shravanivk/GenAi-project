import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./style.scss"
import App from './App.jsx'
import { AuthProvider } from './features/auth/auth.Context'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>,
)