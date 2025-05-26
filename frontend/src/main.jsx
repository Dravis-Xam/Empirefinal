import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Routes from './Routing.jsx'
import { CartProvider } from './modules/Store/CartContext.jsx'
import { AuthProvider } from "./modules/Store/AuthContext.jsx"
import { ThemeProvider } from './modules/Store/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <Routes />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
