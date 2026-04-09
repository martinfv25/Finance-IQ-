import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FinanceAI from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FinanceAI />
  </StrictMode>
)
