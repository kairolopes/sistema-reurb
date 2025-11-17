import React from 'react'
import ReactDOM from 'react-dom/client'
// CORREÇÃO: Adiciona a extensão do arquivo para que o Netlify o encontre
import app from './app.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <app />
  </React.StrictMode>,
)
