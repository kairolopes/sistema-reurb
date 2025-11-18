import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import NovoCadastro from "./pages/NovoCadastro";
import Consultar from "./pages/Consultar";
import Relatorios from "./pages/Relatorios";
import Tickets from "./pages/Tickets";
import Config from "./pages/Config";

// Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBxrh1bZu6cBaGj8YoUJtS5h5VP00SoAh4",
  authDomain: "sistema-reurb.firebaseapp.com",
  projectId: "sistema-reurb",
  storageBucket: "sistema-reurb.firebasestorage.app",
  messagingSenderId: "444345727490",
  appId: "1:444345727490:web:5d9e6dba923781ba91451b",
};

initializeApp(firebaseConfig);

const App = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");

  // Verifica login
  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
  }, []);

  // Tela de Login
 const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("E-mail ou senha incorretos.");
    }
  };

  const forgotPassword = async () => {
    if (!email) return setError("Digite seu e-mail para recuperar a senha.");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("E-mail enviado! Verifique sua caixa de entrada.");
    } catch (err) {
      setError("Erro ao enviar e-mail de recuperação.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">

        <h1 className="text-3xl font-bold text-sky-800 mb-6 text-center">
          Acesso ao Sistema REURB
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-3 text-sm text-center">
            {error}
          </p>
        )}

        {message && (
          <p className="bg-sky-100 text-sky-700 p-3 rounded mb-3 text-sm text-center">
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={login}>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">E-mail</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-sky-300 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Senha</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-sky-300 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition"
          >
            Entrar
          </button>
        </form>

        <button
          onClick={forgotPassword}
          className="text-sm text-sky-600 mt-4 w-full text-center hover:text-sky-800"
        >
          Esqueci minha senha
        </button>

      </div>
    </div>
  );
};

  // Enquanto carrega o estado do usuário
  if (loading) return <div>Carregando...</div>;

  // Se NÃO estiver logado, mostra o login
  if (!user) return <LoginScreen />;

  // Se estiver logado, mostra o sistema
  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} logout={() => signOut(auth)} />

      <main>
        {page === "dashboard" && <Dashboard />}
        {page === "novo" && <NovoCadastro />}
        {page === "consultar" && <Consultar />}
        {page === "relatorios" && <Relatorios />}
        {page === "tickets" && <Tickets />}
        {page === "config" && <Config />}
      </main>
    </div>
  );
};

export default App;

