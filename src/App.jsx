import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import NovoCadastro from "./pages/NovoCadastro";
import Consultar from "./pages/Consultar";
import Relatorios from "./pages/Relatorios";
import Tickets from "./pages/Tickets";
import Config from "./pages/Config";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

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

  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
  }, []);

  const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const login = async (e) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch {
        setError("E-mail ou senha incorretos.");
      }
    };

    const forgotPassword = async () => {
      if (!email) return setError("Digite seu e-mail.");
      try {
        await sendPasswordResetEmail(auth, email);
        setMessage("E-mail enviado para recuperação.");
      } catch {
        setError("Erro ao enviar recuperação.");
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 login-page">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border">
          <h1 className="text-2xl font-bold text-sky-800 mb-6 text-center">
            Acesso ao Sistema REURB
          </h1>

          {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-3">{error}</p>}
          {message && <p className="bg-sky-100 text-sky-700 p-3 rounded mb-3">{message}</p>}

          <form className="space-y-4" onSubmit={login}>
            <input
              type="email"
              placeholder="E-mail"
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="w-full bg-sky-600 text-white py-3 rounded-xl hover:bg-sky-700">
              Entrar
            </button>
          </form>

          <button
            onClick={forgotPassword}
            className="text-sm text-sky-600 mt-4 w-full text-center"
          >
            Esqueci minha senha
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div>Carregando...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} logout={() => signOut(auth)} />

     <main className={user ? "authenticated" : ""}>
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


