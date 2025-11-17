import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import {
  Home,
  Plus,
  Search,
  FileText,
  Ticket,
  Settings,
  LogOut,
  Building,
} from "lucide-react";

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
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

// ==============================
// FIREBASE CONFIGURAÇÃO
// ==============================

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

  // ============================
  // ACOMPANHA LOGIN
  // ============================
  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
  }, []);

  // ============================
  // LOGIN SCREEN
  // ============================
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">

          <h1 className="text-2xl font-bold text-sky-800 mb-6 text-center">
            Acesso ao Sistema REURB
          </h1>

          {error && (
            <p className="bg-red-100 p-3 text-red-700 rounded-lg text-sm mb-3">
              {error}
            </p>
          )}

          {message && (
            <p className="bg-sky-100 p-3 text-sky-700 rounded-lg text-sm mb-3">
              {message}
            </p>
          )}

          <form className="space-y-4" onSubmit={login}>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">E-mail</label>
              <input
                type="email"
                className="p-2 w-full rounded-lg border border-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Senha</label>
              <input
                type="password"
                className="p-2 w-full rounded-lg border border-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700"
            >
              Entrar
            </button>
          </form>

          <button
            onClick={forgotPassword}
            className="text-sm text-sky-600 mt-4 w-full text-center hover:text-sky-800"
          >
            Esqueci a senha
          </button>
        </div>
      </div>
    );
  };

  // ============================
  // LAYOUT COM SIDEBAR
  // ============================
  const Layout = ({ children }) => (
    <div className="flex">
      {/* SIDEBAR */}
      <aside className="w-
