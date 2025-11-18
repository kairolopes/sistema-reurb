import "./index.css";
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
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-sky-800 text-center mb-6">
          Acesso ao Sistema REURB
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-2">
            {error}
          </p>
        )}

        {message && (
          <p className="bg-sky-100 text-sky-700 p-3 rounded mb-2">
            {message}
          </p>
        )}

        <form onSubmit={login} className="space-y-4">

          <div>
            <label className="text-gray-600 font-medium text-sm">E-mail</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded-lg focus:ring focus:ring-sky-200"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-600 font-medium text-sm">Senha</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg focus:ring focus:ring-sky-200"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 transition"
          >
            Entrar
          </button>
        </form>

        <button
          onClick={forgotPassword}
          className="w-full mt-4 text-sm text-sky-600 hover:underline"
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
};

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






