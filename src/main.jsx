import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './design.css';
// 🟢 ESTA LINHA É ESSENCIAL PARA CARREGAR OS ESTILOS
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

