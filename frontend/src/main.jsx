import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'



const storedTheme = localStorage.getItem("phishguard-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
? "dark"
: "light";

document.documentElement.dataset.theme = storedTheme || preferredTheme;
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <BrowserRouter>
   <QueryClientProvider client={queryClient}>
    <App />    
  </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
