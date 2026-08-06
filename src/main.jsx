import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initStorage } from './storage.js'
import './styles.css'

initStorage()

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator && !location.hostname.includes('localhost')) {
  navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js')
}
