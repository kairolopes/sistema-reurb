import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Home,
  FilePlus,
  Search,
  FileText,
  Ticket,
  Settings,
  LogOut,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import NovoCadastro from "./pages/NovoCadastro";
import Consultar from "./pages/Consultar";
import Relatorios from "./pages/Relatorios";
import Tickets from "./pages/Tickets";
import Configuracoes from "./pages/Configuracoes";

// ============= FIREBASE ============= //
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBxrh1bZu6cBaGj8YoUJtS5h5VP00SoAh4",
  authDomain: "sistema-reurb.firebaseapp.com",
  projectId: "sistema-reurb",
  storageBucket: "sistema-reurb.firebasestorage.app",
  messagingSenderId: "444345727490",
  appId: "1:444345727490:web:5d9e6dba923781ba91451b",
  measurementId: "G-MY6RMEMNJV",
};

initializeApp(firebaseConfig);
const auth = getAuth();

// ===================================== //
// =========== LOGIN SCREEN ============= //
// ===================================== //

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError("E-mail ou senha incorretos.");
    }
  };

  const forgotPassword = async () => {
    if (!email) {
      return setError("Digite seu e-mail antes.");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Enviamos um link para redefinir sua senha.");
    } catch (err) {
      setError("Erro ao enviar e-mail de recuperação.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">

        <h1 className="text-2xl font-bold text-sky-800 mb-6 text-center">
          Sistema REURB — Acesso
        </h1>

        {error && (
          <p className="bg-red-100 p-3 text-red-700 rounded-lg mb-3 text-sm">
            {error}
          </p>
        )}

        {message && (
          <p className="bg-green-100 p-3 text-green-700 rounded-lg mb-3 text-sm">
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="text-sm text-gray-600">E-mail</label>
            <input
              type="email"
              className="w-full p-3 border rounded-xl mt-1"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Senha</label>
            <input
              type="password"
              className="w-full p-3 border rounded-xl mt-1"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition">
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

// ===================================== //
// ============= LAYOUT ================= //
// ===================================== //

const Layout = ({ onLogout, children }) => {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6 border-r border-gray-200">
        <h1 className="text-2xl font-bold text-sky-800 mb-8 flex items-center gap-2">
          <Home className="w-6 h-6 text-sky-600" />
          REURB
        </h1>

        <nav className="space-y-2">
          <SidebarItem icon={<Home />} label="Dashboard" to="/" />
          <SidebarItem icon={<FilePlus />} label="Novo Cadastro" to="/novo" />
          <SidebarItem icon={<Search />} label="Consultar" to="/consultar" />
          <SidebarItem icon={<FileText />} label="Relatórios" to="/relatorios" />
          <SidebarItem icon={<Ticket />} label="Tickets" to="/tickets" />
          <SidebarItem icon={<Settings />} label="Configurações" to="/config" />
        </nav>

        <button
          onClick={onLogout}
          className="mt-10 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
};

const SidebarItem = ({ icon, label, to }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition text-gray-700"
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

// ===================================== //
// ============= APP ROOT ============== //
// ===================================== //

const App = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setLogged(!!user);
      setAuthChecked(true);
    });
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sky-600">
        Verificando acesso...
      </div>
    );
  }

  if (!logged) {
    return <LoginScreen onLogin={() => setLogged(true)} />;
  }

  return (
    <Router>
      <Layout onLogout={logout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/novo" element={<NovoCadastro />} />
          <Route path="/consultar" element={<Consultar />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/config" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
