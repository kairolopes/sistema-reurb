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
    <div className="login-container">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        
        <h1 className="text-3xl font-bold text-sky-800 mb-8 text-center">
          Acesso ao Sistema REURB
        </h1>

        {error && <p className="bg-red-100 p-3 rounded text-red-600 mb-2">{error}</p>}
        {message && <p className="bg-sky-100 p-3 rounded text-sky-700 mb-2">{message}</p>}

        <form className="space-y-4" onSubmit={login}>
          
          <div>
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              className="w-full p-2 mt-1 border rounded-lg shadow-sm focus:ring focus:ring-sky-300"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              className="w-full p-2 mt-1 border rounded-lg shadow-sm focus:ring focus:ring-sky-300"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-7

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





