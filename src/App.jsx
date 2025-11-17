import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  setLogLevel,
  deleteDoc,
} from "firebase/firestore";
import {
  Check,
  User,
  Home,
  CornerRightDown,
  Loader2,
  Save,
  Plus,
  Map,
  Building,
  Trash2,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

// ========= CONFIG FIREBASE ========= //
const firebaseConfig = {
  apiKey: "AIzaSyBxrh1bZu6cBaGj8YoUJtS5h5VP00SoAh4",
  authDomain: "sistema-reurb.firebaseapp.com",
  projectId: "sistema-reurb",
  storageBucket: "sistema-reurb.firebasestorage.app",
  messagingSenderId: "444345727490",
  appId: "1:444345727490:web:5d9e6dba923781ba91451b",
  measurementId: "G-MY6RMEMNJV",
};

const appId = typeof __app_id !== "undefined" ? __app_id : "reurb-system-default";
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

// ========= ESTADO INICIAL ========= //
const initialRegistrationState = {
  municipalityId: "",
  subdivisionId: "",
  registrationNumber: "",
  property: {
    unity: "",
    nucleus: "",
    city: "",
    address: "",
    areaSqM: 0,
  },
  occupant: {
    name: "",
    dob: "",
    naturality: "",
    nationality: "BRASILEIRO",
    fatherName: "",
    motherName: "",
    rg: "",
    rgIssuer: "",
    phone: "",
    cpf: "",
    maritalStatus: "Solteiro",
    maritalRegime: "Comunhão parcial",
    marriageDate: "",
    isStableUnion: false,
    stableUnionStartDate: "",
    occupationStatus: "Dona de casa",
    profession: "",
    monthlyIncome: 0,
  },
  spouse: {
    name: "",
    dob: "",
    naturality: "",
    nationality: "BRASILEIRA",
    fatherName: "",
    motherName: "",
    rg: "",
    rgIssuer: "",
    phone: "",
    cpf: "",
    email: "",
    occupationStatus: "Dona de casa",
    profession: "",
    monthlyIncome: 0,
  },
  socioeconomic: {
    totalFamilyIncome: 0,
    acquisitionMethod: "Outro",
    reurbType: "Reurb-S",
    titulationMethod: "Legitimação fundiária",
  },
  declarations: {
    infoIsTrue: false,
    notOwnerOfOtherProperty: false,
    notContemplated: false,
    notTenant: false,
    annuityToMeasures: false,
  },
};

// ======================================================= //
// ================ COMPONENTE PRINCIPAL ================= //
// ======================================================= //

const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const [page, setPage] = useState("dashboard");
  const [subStep, setSubStep] = useState(1);

  const [municipalities, setMunicipalities] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [formData, setFormData] = useState(initialRegistrationState);

  // ======================================================= //
  // =================== INPUT COMPONENTS =================== //
  // ======================================================= //

  const InputField = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required,
    step,
    className,
  }) => (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        step={step}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        className="p-2 rounded-lg border border-gray-300 focus:ring-sky-500 focus:border-sky-500"
      />
    </div>
  );

  const SelectField = ({
    label,
    name,
    value,
    onChange,
    options,
    required,
    className,
  }) => (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        className="p-2 rounded-lg border border-gray-300 bg-white focus:ring-sky-500 focus:border-sky-500"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const CheckboxField = ({ label, name, checked, onChange }) => (
    <label className="flex items-start space-x-2 text-sm text-gray-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 mt-1 text-sky-600"
      />
      <span>{label}</span>
    </label>
  );

  // ======================================================= //
  // ================= AUTENTICAÇÃO FIREBASE =============== //
  // ======================================================= //

  useEffect(() => {
    try {
      setLogLevel("debug");

      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestore = getFirestore(app);

      setAuth(authInstance);
      setDb(firestore);

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
          setUserId(user.uid);
          setUserEmail(user.email);
          setIsAuthenticated(true);
        } else {
          setUserId(null);
          setIsAuthenticated(false);
        }
        setIsAuthReady(true);
      });

      if (initialAuthToken) {
        signInWithCustomToken(authInstance, initialAuthToken).catch(() => {});
      }

      return () => unsubscribe();
    } catch (e) {
      setError("Falha ao iniciar Firebase.");
      setIsAuthReady(true);
    }
  }, []);

  // ======================================================= //
  // ================== LOGIN SCREEN ======================= //
  // ======================================================= //
import { sendPasswordResetEmail } from "firebase/auth";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Erro ao acessar. Verifique e-mail e senha.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setError(null);
    setMessage("");

    if (!email) {
      setError("Informe seu e-mail para recuperar a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Um link de redefinição foi enviado para o seu e-mail.");
    } catch (err) {
      setError("Não foi possível enviar o e-mail. Verifique o endereço informado.");
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

        <form className="space-y-4" onSubmit={submit}>
          <InputField
            label="E-mail"
            name="email"
            required
            type="email"
            value={email}
            placeholder="seu.email@exemplo.com"
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            label="Senha"
            name="password"
            required
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition shadow-md"
          >
            {loading ? "Aguarde..." : "Entrar"}
          </button>
        </form>

        <button
          onClick={handleForgotPassword}
          className="text-sm text-sky-600 mt-4 w-full text-center hover:text-sky-800"
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
};

  
  // ============================================================== //
  // ===================== RENDER PRINCIPAL ======================= //
  // ============================================================== //

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sky-700">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Conectando...
      </div>
    );
  }

  if (!isAuthenticated) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">
        <header className="flex justify-between items-center pb-4 border-b">
          <h1 className="text-3xl font-bold text-sky-800 flex items-center">
            <Home className="w-6 h-6 mr-2 text-sky-500" />
            Sistema REURB
          </h1>

          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </button>
        </header>

        <div className="mt-6 text-gray-700">
          <h2 className="text-xl font-semibold">Painel do Sistema</h2>
          <p>Agora você pode navegar pelo sistema normalmente.</p>
        </div>
      </div>
    </div>
  );
};

export default App;


