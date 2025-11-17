import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithCustomToken, onAuthStateChanged, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut 
} from 'firebase/auth';
import {
  getFirestore, doc, setDoc, collection, runTransaction,
  serverTimestamp, onSnapshot, setLogLevel, deleteDoc
} from 'firebase/firestore';
import { Check, User, Home, CornerRightDown, Loader2, Save, Plus, Map, Building, Trash2, LogIn, UserPlus, LogOut } from 'lucide-react';

// Variáveis globais de ambiente fornecidas pelo Canvas (MANDATÓRIO usar)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'reurb-system-default';
// ====================================================================
// PASSO CRÍTICO: SUA CONFIGURAÇÃO firebaseConfig REAL, INSERIDA AQUI.
const firebaseConfig = { 
  apiKey: "AIzaSyBxrm1blzdcaGJ8YvoUlTS5hSVP900S0AH4", 
  authDomain: "sistema-reurb.firebaseapp.com",
  projectId: "sistema-reurb",
  storageBucket: "sistema-reurb.firebasestorage.app",
  messagingSenderId: "444345727490",
  appId: "1:444345727490:web:5d9e6dba923781ba91451b",
  measurementId: "G-MY6REMMEJV"
}; 
// ====================================================================

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Estrutura de Dados do Cadastro ---
const initialRegistrationState = {
  municipalityId: '',
  subdivisionId: '',
  registrationNumber: '',
  property: {
    unity: '', nucleus: '', city: '', address: '', areaSqM: 0,
  },
  occupant: {
    name: '', dob: '', naturality: '', nationality: 'BRASILEIRO', fatherName: '', motherName: '', rg: '', rgIssuer: '', phone: '', cpf: '', maritalStatus: 'Solteiro', maritalRegime: 'Comunhão parcial', marriageDate: '', isStableUnion: false, stableUnionStartDate: '', occupationStatus: 'Dona de casa', profession: '', monthlyIncome: 0,
  },
  spouse: {
    name: '', dob: '', naturality: '', nationality: 'BRASILEIRA', fatherName: '', motherName: '', rg: '', rgIssuer: '', phone: '', cpf: '', email: '', occupationStatus: 'Dona de casa', profession: '', monthlyIncome: 0,
  },
  socioeconomic: {
    totalFamilyIncome: 0, acquisitionMethod: 'Outro', reurbType: 'Reurb-S', titulationMethod: 'Legitimação fundiária',
  },
  declarations: {
    infoIsTrue: false, notOwnerOfOtherProperty: false, notContemplated: false, notTenant: false, annuityToMeasures: false,
  },
};

const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // Estado para exibir o email
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State para navegação entre "páginas"
  const [page, setPage] = useState('dashboard');
  const [subStep, setSubStep] = useState(1); // Para o fluxo de NewRegistration

  // State para dados dinâmicos do Firestore
  const [municipalities, setMunicipalities] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  
  // State para o formulário de cadastro principal
  const [formData, setFormData] = useState(initialRegistrationState);
  const [message, setMessage] = useState('');

  // --- Funções de Componentes Auxiliares ---

  const Subtitle = ({ icon: Icon, title }) => (
    <h2 className="flex items-center text-xl font-semibold text-sky-700 mt-6 mb-4 border-b pb-2">
      <Icon className="w-5 h-5 mr-2" />
      {title}
    </h2>
  );

  const InputField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', className = '', step }) => (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        className="p-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150"
      />
    </div>
  );

  const SelectField = ({ label, name, value, onChange, options, required = false, className = '' }) => (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-sky-500 focus:border-sky-500 transition duration-150"
      >
        {options.map((option, index) => (
          <option key={index} value={option.value || option.name}>
            {option.label || option.name}
          </option>
        ))}
      </select>
    </div>
  );

  const CheckboxField = ({ label, name, checked, onChange }) => (
    <div className="flex items-start mb-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
      />
      <label className="ml-2 text-sm text-gray-700 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );

  // --- Funções de Autenticação ---

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged irá atualizar os estados isAuthenticated e userId
      setMessage('Login realizado com sucesso! Redirecionando...');
    } catch (e) {
      console.error("Erro no login:", e);
      // Traduzir erros comuns de autenticação
      const msg = e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' ? 
        'E-mail ou senha inválidos.' : 
        'Erro ao tentar entrar. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged irá atualizar os estados isAuthenticated e userId
      setMessage('Cadastro e Login realizados com sucesso! Redirecionando...');
    } catch (e) {
      console.error("Erro no cadastro:", e);
      // Traduzir erros comuns de autenticação
      const msg = e.code === 'auth/weak-password' ? 
        'A senha deve ter pelo menos 6 caracteres.' : e.code === 'auth/email-already-in-use' ?
        'Este e-mail já está cadastrado.' : 
        'Erro ao tentar cadastrar. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      // onAuthStateChanged irá atualizar os estados isAuthenticated e userId
      setMessage('Sessão encerrada com sucesso.');
      setPage('dashboard'); // Volta para o início (que será a tela de login)
    } catch (e) {
      console.error("Erro ao sair:", e);
      setError('Erro ao encerrar a sessão.');
    } finally {
      setLoading(false);
    }
  };


  // --- 1. Inicialização e Autenticação Firebase ---
  useEffect(() => {
    // Verifica se a configuração foi colada corretamente
    if (firebaseConfig === null || typeof firebaseConfig !== 'object' || !firebaseConfig.apiKey) {
      setError("ERRO CRÍTICO: Cole o objeto firebaseConfig no código (Ver Passo 2.4 do Guia).");
      setIsAuthReady(true); // Permite renderizar o erro
      return;
    }

    try {
      setLogLevel('debug');
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const userAuth = getAuth(app);

      setDb(firestore);
      setAuth(userAuth);

      // Tenta usar o token inicial se estiver disponível
      const tryInitialAuth = async () => {
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(userAuth, initialAuthToken);
          } catch (e) {
            console.warn("Falha ao usar token inicial, prosseguindo para login manual.", e);
          }
        }
      };
      tryInitialAuth();


      const unsubscribe = onAuthStateChanged(userAuth, (user) => {
        if (user) {
          // Usuário logado
          setUserId(user.uid);
          setUserEmail(user.email || 'Usuário Autenticado');
          setIsAuthenticated(true);
        } else {
          // Usuário deslogado
          setUserId(null); 
          setUserEmail(null);
          setIsAuthenticated(false);
        }
        setIsAuthReady(true); // Firebase está inicializado e o status de auth é conhecido
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Erro na inicialização do Firebase:", e);
      setError("Erro ao inicializar o Firebase. Consulte o console.");
      setIsAuthReady(true);
    }
  }, []); // Seus arrays de dependências estão vazios, o que significa que o useEffect é executado uma vez no início. 

  // --- 2. Listeners de Dados (Prefeituras e Loteamentos) ---

  useEffect(() => {
    // CORREÇÃO: Impede a execução se o userId não estiver pronto/logado
    if (!db || !isAuthenticated || !userId) {
        // Se o usuário não está autenticado, os listeners não precisam rodar.
        return;
    }

    // --- USANDO CAMINHO PRIVADO PARA GARANTIR PERMISSÃO ---
    const muniColRef = collection(db, 'artifacts', appId, 'users', userId, 'municipalities');
    const unsubscribeMuni = onSnapshot(muniColRef, (snapshot) => {
      const muniList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMunicipalities(muniList.sort((a, b) => a.name.localeCompare(b.name)));
    }, (e) => {
      console.error("Erro ao carregar Prefeituras:", e);
      if (e.code !== 'permission-denied') {
          setError("Erro ao carregar dados das Prefeituras.");
      }
    });

    const subdivColRef = collection(db, 'artifacts', appId, 'users', userId, 'subdivisions');
    const unsubscribeSubdiv = onSnapshot(subdivColRef, (snapshot) => {
      const subdivList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubdivisions(subdivList);
    }, (e) => {
      console.error("Erro ao carregar Loteamentos:", e);
      if (e.code !== 'permission-denied') {
        setError("Erro ao carregar dados dos Loteamentos.");
      }
    });

    return () => {
      unsubscribeMuni();
      unsubscribeSubdiv();
    };
  }, [db, isAuthenticated, userId]); // Depende de isAuthenticated e userId


  // --- 3. Lógica Comum de Formulário ---
  
  const handlePropertyChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, property: { ...prev.property, [name]: type === 'number' ? parseFloat(value) : value } }));
  };
  const handleOccupantChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, occupant: { ...prev.occupant, [name]: type === 'number' ? parseFloat(value) : value } }));
  };
  const handleSpouseChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, spouse: { ...prev.spouse, [name]: type === 'number' ? parseFloat(value) : value } }));
  };
  const handleSocioeconomicChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, socioeconomic: { ...prev.socioeconomic, [name]: type === 'number' ? parseFloat(value) : value } }));
  };
  const handleDeclarationChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, declarations: { ...prev.declarations, [name]: checked } }));
  };
  const handleMunicipalityChange = (e) => {
    const municipalityId = e.target.value;
    setFormData(prev => ({ 
        ...prev, 
        municipalityId: municipalityId,
        // Limpa o loteamento ao trocar de prefeitura
        subdivisionId: '' 
    }));
  };
  const handleSubdivisionChange = (e) => {
    setFormData(prev => ({ ...prev, subdivisionId: e.target.value }));
  };

  // --- 4. Gerenciamento de Prefeituras (Página) ---

  const MunicipalityManagement = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState(''); // Ex: COLI-GO

    // --- USANDO CAMINHO PRIVADO ---
    const muniColRef = collection(db, 'artifacts', appId, 'users', userId, 'municipalities');

    const handleAddMunicipality = async (e) => {
      e.preventDefault();
      if (!name || !code) return;

      setLoading(true);
      try {
        const newMuniRef = doc(muniColRef); // Firestore gera o ID
        await setDoc(newMuniRef, {
          id: newMuniRef.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          createdAt: serverTimestamp(),
        });
        setMessage(`Prefeitura "${name}" cadastrada com sucesso!`);
        setName('');
        setCode('');
      } catch (e) {
        setError(`Erro ao cadastrar prefeitura: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteMunicipality = async (muniId, muniName) => {
      // ATENÇÃO: Remoção direta do item conforme instrução de não usar window.confirm/alert. 
      // Em uma aplicação real, aqui haveria um modal de confirmação baseado em estado.

      setLoading(true);
      setMessage(`Excluindo ${muniName}...`);
      try {
        // 1. Deletar todos os loteamentos relacionados (MUDANÇA AQUI)
        const subdivColRef = collection(db, 'artifacts', appId, 'users', userId, 'subdivisions');
        const subdivsToDelete = subdivisions.filter(s => s.municipalityId === muniId);
        for (const subdiv of subdivsToDelete) {
            await deleteDoc(doc(subdivColRef, subdiv.id));
        }

        // 2. Deletar a prefeitura
        await deleteDoc(doc(muniColRef, muniId));
        setMessage(`Prefeitura "${muniName}" e ${subdivsToDelete.length} loteamento(s) relacionados excluídos com sucesso!`);
      } catch (e) {
        setError(`Erro ao excluir prefeitura: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };


    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-sky-800 flex items-center"><Building className="w-6 h-6 mr-2"/> Gerenciar Prefeituras</h2>
        
        {/* Formulário de Cadastro */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Nova Prefeitura</h3>
          <form onSubmit={handleAddMunicipality} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField 
              label="Nome da Prefeitura" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="md:col-span-2"
            />
            <InputField 
              label="Código/ID (Ex: COLI-GO)" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              required 
            />
            <button
              type="submit"
              disabled={loading || !name || !code}
              className="md:col-span-3 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {loading ? 'Salvando...' : 'Cadastrar Prefeitura'}
            </button>
          </form>
        </div>

        {/* Lista de Prefeituras */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Prefeituras Cadastradas ({municipalities.length})</h3>
          <ul className="space-y-3">
            {municipalities.length === 0 ? (
              <p className="text-gray-500">Nenhuma prefeitura cadastrada.</p>
            ) : (
              municipalities.map(muni => (
                <li key={muni.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{muni.name}</p>
                    <p className="text-sm text-sky-600 font-mono">ID: {muni.code}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteMunicipality(muni.id, muni.name)}
                    className="ml-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    title="Excluir Prefeitura"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    );
  };

  // --- 5. Gerenciamento de Loteamentos (Página) ---

  const SubdivisionManagement = () => {
    const [muniId, setMuniId] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState(''); // Ex: VLB

    // --- USANDO CAMINHO PRIVADO ---
    const subdivColRef = collection(db, 'artifacts', appId, 'users', userId, 'subdivisions');

    const handleAddSubdivision = async (e) => {
      e.preventDefault();
      if (!muniId || !name || !code) return;

      setLoading(true);
      try {
        const newSubdivRef = doc(subdivColRef);
        await setDoc(newSubdivRef, {
          id: newSubdivRef.id,
          municipalityId: muniId,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          createdAt: serverTimestamp(),
        });
        setMessage(`Loteamento "${name}" cadastrado com sucesso!`);
        setName('');
        setCode('');
        setMuniId(''); // Reinicia a seleção de prefeitura
      } catch (e) {
        setError(`Erro ao cadastrar loteamento: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    const handleDeleteSubdivision = async (subdivId, subdivName) => {
      // ATENÇÃO: Remoção direta do item conforme instrução de não usar window.confirm/alert. 
      // Em uma aplicação real, aqui haveria um modal de confirmação baseado em estado.
      
      setLoading(true);
      setMessage(`Excluindo ${subdivName}...`);
      try {
        await deleteDoc(doc(subdivColRef, subdivId));
        setMessage(`Loteamento "${subdivName}" excluído com sucesso!`);
      } catch (e) {
        setError(`Erro ao excluir loteamento: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };


    const subdivisionsByMuni = municipalities.map(muni => ({
        ...muni,
        subdivisions: subdivisions.filter(s => s.municipalityId === muni.id).sort((a, b) => a.name.localeCompare(b.name))
    })).filter(m => m.subdivisions.length > 0);


    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-sky-800 flex items-center"><Map className="w-6 h-6 mr-2"/> Gerenciar Loteamentos</h2>
        
        {/* Formulário de Cadastro */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Novo Loteamento / Núcleo Urbano</h3>
          <form onSubmit={handleAddSubdivision} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Prefeitura Relacionada"
              name="muniId"
              value={muniId}
              onChange={(e) => setMuniId(e.target.value)}
              options={[{ label: 'Selecione a Prefeitura', value: '' }, ...municipalities.map(m => ({ value: m.id, label: m.name }))]}
              required
              className="md:col-span-3"
            />
            {municipalities.length === 0 && <p className="text-red-500 col-span-3">Nenhuma prefeitura disponível para vincular. Cadastre uma primeiro.</p>}

            <InputField 
              label="Nome do Loteamento" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="md:col-span-2"
            />
            <InputField 
              label="Código (Ex: VLB)" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              required 
            />
            <button
              type="submit"
              disabled={loading || !muniId || !name || !code}
              className="md:col-span-3 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {loading ? 'Salvando...' : 'Cadastrar Loteamento'}
            </button>
          </form>
        </div>

        {/* Lista de Loteamentos */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Loteamentos Cadastrados</h3>
            {municipalities.length === 0 ? (
                <p className="text-gray-500">Cadastre uma prefeitura primeiro.</p>
            ) : subdivisions.length === 0 ? (
                <p className="text-gray-500">Nenhum loteamento cadastrado.</p>
            ) : (
                <ul className="space-y-4">
                    {municipalities.map(muni => {
                        const relatedSubdivisions = subdivisions.filter(s => s.municipalityId === muni.id);
                        if (relatedSubdivisions.length === 0) return null;

                        return (
                            <li key={muni.id} className="border-b pb-2">
                                <h4 className="font-bold text-lg text-sky-800 bg-sky-50 p-2 rounded-lg">{muni.name} ({relatedSubdivisions.length})</h4>
                                <ul className="mt-2 space-y-1 pl-4">
                                    {relatedSubdivisions.map(subdiv => (
                                        <li key={subdiv.id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-700">{subdiv.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">Cód: {subdiv.code} | ID: {subdiv.id}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteSubdivision(subdiv.id, subdiv.name)}
                                                className="ml-4 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                                                title="Excluir Loteamento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
      </div>
    );
  };

  // --- 6. Fluxo de Cadastro Principal (NewRegistration) ---

  const generateRegistrationNumberAndSave = useCallback(async () => {
    if (!db || !userId) {
      setError("Sistema não inicializado. Tente novamente.");
      return;
    }
    
    // Validar se todas as declarações obrigatórias foram aceitas
    const allDeclarationsAccepted = Object.values(formData.declarations).every(value => value === true);
    if (!allDeclarationsAccepted) {
        setMessage('Erro: Todas as declarações são obrigatórias para prosseguir.');
        return;
    }

    setLoading(true);
    setMessage('');
    setError(null);

    const { municipalityId, subdivisionId } = formData;
    const muniCode = municipalities.find(m => m.id === municipalityId)?.code || 'MUNI';
    const subdivCode = subdivisions.find(s => s.id === subdivisionId)?.code || 'LOTE';

    // O contador agora é baseado na combinação de ID de Prefeituras e Loteamentos
    const counterDocId = `${municipalityId}_${subdivisionId}`; 
    
    // --- USANDO CAMINHO PRIVADO PARA COUNTERS ---
    const counterDocRef = doc(db, 'artifacts', appId, 'users', userId, 'counters', counterDocId);
    
    // --- USANDO CAMINHO PRIVADO PARA REGISTRATIONS ---
    const registrationsColRef = collection(db, 'artifacts', appId, 'users', userId, 'registrations');

    try {
      // Usar Transação para garantir atomicidade na geração do número sequencial
      const newRegistrationNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterDocRef);
        let currentSequence = 0;

        if (counterDoc.exists()) {
          currentSequence = counterDoc.data().sequence;
        }

        const newSequence = currentSequence + 1;
        
        // Atualiza o contador (cria se não existir)
        transaction.set(counterDocRef, { sequence: newSequence, municipalityId, subdivisionId, updatedAt: serverTimestamp() }, { merge: true });

        // Formata o número: MUNI_CODIGO_LOTE_CODIGO-SEQ
        const formattedSequence = String(newSequence).padStart(5, '0');
        return `${muniCode}-${subdivCode}-${formattedSequence}`;
      });

      // Dados a serem salvos
      const finalData = {
        ...formData,
        registrationNumber: newRegistrationNumber,
        userId: userId, // ID do Cadastrador/Usuário
        municipalityCode: muniCode,
        subdivisionCode: subdivCode,
        createdAt: serverTimestamp(),
      };

      // Salva o documento de cadastro
      const newRegistrationDocRef = doc(registrationsColRef, newRegistrationNumber);
      await setDoc(newRegistrationDocRef, finalData);

      setFormData(prev => ({ ...prev, registrationNumber: newRegistrationNumber }));
      setMessage(`Cadastro realizado com sucesso! Número: ${newRegistrationNumber}`);
      setSubStep(3); // Avança para a tela de sucesso
    } catch (e) {
      console.error("Erro ao gerar número e salvar:", e);
      setError(`Erro ao salvar no banco de dados. ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [db, userId, formData, municipalities, subdivisions]);


  const Step1Selection = () => {
    
    const availableSubdivisions = subdivisions.filter(s => s.municipalityId === formData.municipalityId);
    
    return (
      <div className="space-y-6">
        <Subtitle icon={CornerRightDown} title="Passo 1: Seleção Inicial" />

        <SelectField
          label="Prefeitura (Município)"
          name="municipalityId"
          value={formData.municipalityId}
          onChange={handleMunicipalityChange}
          options={[{ label: 'Selecione a Prefeitura', value: '' }, ...municipalities.map(m => ({ value: m.id, label: m.name }))]}
          required
          className="col-span-1"
        />
        {municipalities.length === 0 && <p className="text-red-500">Nenhuma prefeitura cadastrada. Cadastre uma na Administração.</p>}

        {formData.municipalityId && (
          <SelectField
            label="Loteamento / Núcleo Urbano"
            name="subdivisionId"
            value={formData.subdivisionId}
            onChange={handleSubdivisionChange}
            options={[{ label: 'Selecione o Loteamento', value: '' }, ...availableSubdivisions.map(s => ({ value: s.id, label: s.name }))]}
            required
            className="col-span-1"
          />
        )}
        {formData.municipalityId && availableSubdivisions.length === 0 && (
            <p className="text-red-500">Nenhum loteamento cadastrado para esta prefeitura.</p>
        )}


        <button
          onClick={() => setSubStep(2)}
          disabled={!formData.municipalityId || !formData.subdivisionId || loading}
          className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 disabled:bg-gray-400 transition duration-200 shadow-md"
        >
          Prosseguir para Cadastro
        </button>
      </div>
    );
  };

  const Step2Registration = () => (
    <form onSubmit={(e) => { e.preventDefault(); generateRegistrationNumberAndSave(); }}>
      <Subtitle icon={User} title="Identificação do Ocupante Principal" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Nome Completo" name="name" value={formData.occupant.name} onChange={handleOccupantChange} required className="col-span-3" />
        <InputField label="CPF" name="cpf" value={formData.occupant.cpf} onChange={handleOccupantChange} required />
        <InputField label="Data de Nascimento" name="dob" value={formData.occupant.dob} onChange={handleOccupantChange} type="date" required />
        <InputField label="Naturalidade (Cidade-UF)" name="naturality" value={formData.occupant.naturality} onChange={handleOccupantChange} />
        <InputField label="Nome da Mãe" name="motherName" value={formData.occupant.motherName} onChange={handleOccupantChange} required className="col-span-2" />
        <InputField label="Nome do Pai" name="fatherName" value={formData.occupant.fatherName} onChange={handleOccupantChange} className="col-span-2" />
        <InputField label="Nº Identidade (RG)" name="rg" value={formData.occupant.rg} onChange={handleOccupantChange} />
        <InputField label="Órgão Expedidor/UF" name="rgIssuer" value={formData.occupant.rgIssuer} onChange={handleOccupantChange} />
        <InputField label="Telefone" name="phone" value={formData.occupant.phone} onChange={handleOccupantChange} />
        <SelectField
          label="Estado Civil"
          name="maritalStatus"
          value={formData.occupant.maritalStatus}
          onChange={handleOccupantChange}
          options={['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'Separado judicialmente', 'União Estável'].map(s => ({ value: s, label: s }))}
          required
        />
        {(formData.occupant.maritalStatus === 'Casado') && (
          <>
            <SelectField
              label="Regime de Bens"
              name="maritalRegime"
              value={formData.occupant.maritalRegime}
              onChange={handleOccupantChange}
              options={['Comunhão parcial', 'Comunhão universal', 'Separação de bens', 'Outro'].map(s => ({ value: s, label: s }))}
            />
            <InputField label="Data de Casamento" name="marriageDate" value={formData.occupant.marriageDate} onChange={handleOccupantChange} type="date" />
          </>
        )}
      </div>

      <Subtitle icon={Home} title="Dados da Unidade Imobiliária" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Endereço Completo" name="address" value={formData.property.address} onChange={handlePropertyChange} required className="col-span-3" />
        <InputField label="Cidade-UF" name="city" value={formData.property.city} onChange={handlePropertyChange} required />
        <InputField label="UNIDADE IMOBILIÁRIA (Quadra/Lote)" name="unity" value={formData.property.unity} onChange={handlePropertyChange} required />
        <InputField label="Área (m²)" name="areaSqM" value={formData.property.areaSqM} onChange={handlePropertyChange} type="number" step="0.01" required />
        <InputField label="Método de Aquisição" name="acquisitionMethod" value={formData.socioeconomic.acquisitionMethod} onChange={handleSocioeconomicChange} required className="col-span-2" placeholder="Compra e venda particular/recibo, Herança, Outro..." />
      </div>

      <Subtitle icon={User} title="Identificação do Cônjuge/Companheiro (Opcional)" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Nome Completo Cônjuge" name="name" value={formData.spouse.name} onChange={handleSpouseChange} className="col-span-3" />
        <InputField label="CPF Cônjuge" name="cpf" value={formData.spouse.cpf} onChange={handleSpouseChange} />
        <InputField label="Data de Nascimento Cônjuge" name="dob" value={formData.spouse.dob} onChange={handleSpouseChange} type="date" />
        <InputField label="Telefone Cônjuge" name="phone" value={formData.spouse.phone} onChange={handleSpouseChange} />
        <InputField label="Email Cônjuge" name="email" value={formData.spouse.email} onChange={handleSpouseChange} className="col-span-2" />
      </div>
      
      <Subtitle icon={Check} title="Declarações Obrigatórias do Ocupante" />
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <p className="text-sm font-semibold text-red-600 mb-4">ATENÇÃO: Todas as caixas abaixo devem ser marcadas para prosseguir com a Regularização Fundiária.</p>
        <CheckboxField
          label="Declaro que todas as informações prestadas são verdadeiras."
          name="infoIsTrue"
          checked={formData.declarations.infoIsTrue}
          onChange={handleDeclarationChange}
        />
        <CheckboxField
          label="Não sou/somos proprietário(s) exclusivo(s) de outro imóvel urbano ou rural."
          name="notOwnerOfOtherProperty"
          checked={formData.declarations.notOwnerOfOtherProperty}
          onChange={handleDeclarationChange}
        />
        <CheckboxField
          label="Não fui/fomos contemplado(s) com legitimação de posse ou fundiária de imóvel urbano com mesma finalidade."
          name="notContemplated"
          checked={formData.declarations.notContemplated}
          onChange={handleDeclarationChange}
        />
        <CheckboxField
          label="Não sou locatário do imóvel e exerço a posse com intenção de 'agir como dono'."
          name="notTenant"
          checked={formData.declarations.notTenant}
          onChange={handleDeclarationChange}
        />
        <CheckboxField
          label="Manifesto anuência em relação às medidas, área, limites e confrontações do meu imóvel."
          name="annuityToMeasures"
          checked={formData.declarations.annuityToMeasures}
          onChange={handleDeclarationChange}
        />
      </div>

      <div className="flex justify-between items-center mt-8 pt-4 border-t">
        <button
          type="button"
          onClick={() => setSubStep(1)}
          className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition duration-200"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading || !Object.values(formData.declarations).every(value => value === true)}
          className="flex items-center bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 transition duration-200 shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {loading ? 'Processando...' : 'Salvar e Gerar N° de Cadastro'}
        </button>
      </div>
    </form>
  );

  const Step3Success = () => (
    <div className="space-y-6 text-center p-8 bg-white shadow-xl rounded-2xl border border-green-200">
      <div className="p-4 bg-green-100 rounded-full inline-block">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-green-700">Cadastro Concluído!</h2>
      <p className="text-gray-600 text-lg">
        O processo de Regularização Fundiária foi iniciado.
      </p>
      <div className="bg-green-50 p-4 rounded-xl border border-green-300 inline-block">
        <p className="text-lg font-mono text-green-800 break-all">
          <span className="font-semibold text-gray-700">Nº de Cadastro Único:</span> <br/>{formData.registrationNumber}
        </p>
        <p className="text-xs text-gray-500 mt-1">
            Este número identifica a Prefeitura, o Loteamento e o Registro Sequencial do ocupante.
        </p>
      </div>
      
      <div className="pt-4 flex flex-col items-center space-y-3">
        <button
            onClick={() => {
                setFormData(initialRegistrationState);
                setPage('newRegistration');
                setSubStep(1); 
            }}
            className="w-full max-w-sm bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 transition duration-200"
        >
            Realizar Novo Cadastro
        </button>
        <button
            onClick={() => setPage('dashboard')}
            className="w-full max-w-sm bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition duration-200"
        >
            Voltar para o Painel Principal
        </button>
      </div>
    </div>
  );

  const NewRegistrationFlow = () => {
    switch(subStep) {
        case 1:
            return <Step1Selection />;
        case 2:
            return <Step2Registration />;
        case 3:
            return <Step3Success />;
        default:
            return <Step1Selection />;
    }
  }

  // --- 7. Página Principal (Dashboard) ---

  const Dashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-sky-800">Painel Principal</h2>
      <p className="text-gray-600">Selecione uma opção para gerenciar o sistema ou iniciar um novo cadastro.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => setPage('newRegistration')}
          className="bg-white p-6 border-4 border-sky-400 text-sky-700 rounded-xl shadow-xl cursor-pointer hover:bg-sky-50 transition duration-300 transform hover:scale-[1.02]"
        >
          <CornerRightDown className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-semibold">Iniciar Novo Cadastro</h3>
          <p className="text-sm text-gray-500">Fluxo de registro de Ocupante e Imóvel.</p>
        </div>
        
        <div 
          onClick={() => setPage('manageMunicipalities')}
          className="bg-white p-6 border border-gray-200 rounded-xl shadow cursor-pointer hover:bg-gray-50 transition duration-300"
        >
          <Building className="w-8 h-8 mb-3 text-gray-600" />
          <h3 className="text-xl font-semibold">Gerenciar Prefeituras</h3>
          <p className="text-sm text-gray-500">Cadastrar, editar e excluir municípios.</p>
        </div>
        
        <div 
          onClick={() => setPage('manageSubdivisions')}
          className="bg-white p-6 border border-gray-200 rounded-xl shadow cursor-pointer hover:bg-gray-50 transition duration-300"
        >
          <Map className="w-8 h-8 mb-3 text-gray-600" />
          <h3 className="text-xl font-semibold">Gerenciar Loteamentos</h3>
          <p className="text-sm text-gray-500">Cadastrar e gerenciar núcleos urbanos por prefeitura.</p>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Ações Futuras (Placeholder)</h3>
        <div className="flex flex-col space-y-3">
            <button className="bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200" onClick={() => setMessage('Funcionalidade de Relatórios em Desenvolvimento...')}>
                <span className="opacity-70">Ver Relatórios e Documentos</span>
            </button>
            <button className="bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200" onClick={() => setMessage('Funcionalidade de Comunicação com Cartórios em Desenvolvimento...')}>
                <span className="opacity-70">Comunicações e Envio (Cartórios/Prefeitura)</span>
            </button>
        </div>
      </div>
    </div>
  );

  // --- 8. Tela de Login ---
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isRegisterMode) {
        handleRegister(email, password);
      } else {
        handleLogin(email, password);
      }
    };

    return (
      <div className="max-w-md mx-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-bold text-sky-800 mb-6 flex items-center justify-center">
            {isRegisterMode ? <UserPlus className="w-6 h-6 mr-2" /> : <LogIn className="w-6 h-6 mr-2" />}
            {isRegisterMode ? 'Cadastro de Usuário' : 'Acesso ao Sistema REURB'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 text-sm" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-sky-100 border border-sky-400 text-sky-700 px-4 py-3 rounded-xl relative mb-4 text-sm" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu.email@exemplo.com"
          />
          <InputField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition duration-200 flex items-center justify-center ${
              isRegisterMode ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'
            } text-white disabled:bg-gray-400`}
          >
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : isRegisterMode ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
            {loading ? 'Processando...' : isRegisterMode ? 'Cadastrar e Entrar' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-6 pt-4 border-t text-center">
          <button
            onClick={() => {
                setIsRegisterMode(prev => !prev);
                setError(null);
                setMessage('');
            }}
            className="text-sm text-sky-600 hover:text-sky-800 transition"
          >
            {isRegisterMode ? 'Já tem conta? Faça Login' : 'Não tem conta? Crie uma aqui'}
          </button>
        </div>
      </div>
    );
  };


  // --- 9. Renderização Principal (Controle de Páginas) ---
  
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'manageMunicipalities':
        return <MunicipalityManagement />;
      case 'manageSubdivisions':
        return <SubdivisionManagement />;
      case 'newRegistration':
        return <NewRegistrationFlow />;
      default:
        return <Dashboard />;
    }
  };


  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 mr-2 animate-spin text-sky-600" />
        <p className="text-lg text-gray-600">Conectando ao Firebase...</p>
      </div>
    );
  }

  // Se não estiver autenticado, mostra a tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-center justify-center">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; }
        `}</style>
        <LoginScreen />
      </div>
    );
  }

  // Se estiver autenticado, mostra o sistema principal
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100">
        <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-sky-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-sky-500"><path d="M12 2l8 4.5v9L12 22l-8-4.5v-9L12 2z"/><polyline points="12 2 12 12 20 7.5 12 12 4 7.5 12 12"/></svg>
            Sistema REURB
          </h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm text-gray-600 hidden sm:flex">
                <User className="w-4 h-4 mr-1 text-sky-600" />
                {userEmail}
            </div>
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition flex items-center"
                title="Sair do Sistema"
            >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="bg-sky-100 border border-sky-400 text-sky-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
            <span className="block sm:inline ml-2">{message}</span>
          </div>
        )}

        {renderPage()}

        <footer className="mt-10 pt-4 border-t text-xs text-gray-400 text-center">
            <p>ID do Usuário Logado: <span className="font-mono bg-gray-100 p-1 rounded text-gray-600">{userId}</span></p>
            <p>App ID: {appId}</p>
        </footer>

      </div>
    </div>
  );
};

export default App;