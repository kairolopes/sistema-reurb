import React, { useState, useEffect, useCallback, useMemo } from "react";
// Importações de componentes de terceiros
// (Removidas/Comentadas pois foram integradas ao App.jsx conforme regra de arquivo único)

// Firebase
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  signInAnonymously,
  signInWithCustomToken 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  setDoc,
  where
} from "firebase/firestore";
import { setLogLevel } from "firebase/firestore";


// Configuração Firebase (Deve usar a variável global do ambiente)
// Variáveis Globais (Assumidas como disponíveis no ambiente Canvas)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'sistema-reurb';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyBxrh1bZu6cBaGj8YoUJtS5h5VP00SoAh4",
  authDomain: "sistema-reurb.firebaseapp.com",
  projectId: "sistema-reurb",
  storageBucket: "sistema-reurb.firebasestorage.app",
  messagingSenderId: "444345727490",
  appId: "1:444345727490:web:5d9e6dba923781ba91451b",
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicialização de App e Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
setLogLevel('Debug'); // Habilita logs de debug do Firestore

// Função Helper para Caminho Público do Firestore
const getPublicCollection = (collectionName) => {
  // Assume que as regras de segurança permitem leitura/escrita para usuários autenticados
  return collection(db, `/artifacts/${appId}/public/data/${collectionName}`);
};

// =================================================================
// 1. LÓGICA DE GERAÇÃO DE ID SEQUENCIAL
// =================================================================

/**
 * Gera o próximo número de cadastro sequencial (ANO-MUN-LOT-SEQ).
 */
const generateCadastroId = async (loteamentoId, municipios, loteamentos) => {
  const currentYear = new Date().getFullYear().toString();
  
  // 1. Encontrar o loteamento e o município
  const loteamento = loteamentos.find(l => l.id === loteamentoId);
  if (!loteamento) throw new Error("Loteamento não encontrado para gerar ID.");
  
  const municipio = municipios.find(m => m.id === loteamento.id_municipio_fk);
  if (!municipio) throw new Error("Município não encontrado para gerar ID.");

  const municipioCode = municipio.codigo_sigla;
  const loteamentoCode = loteamento.codigo_nucleo;
  
  // Prefixo de pesquisa: 2025-GOS-VLB0
  const prefixo = `${currentYear}-${municipioCode}-${loteamentoCode}`;
  
  // 2. Consultar o último cadastro com esse prefixo
  const cadastrosCol = getPublicCollection('cadastros');
  const q = query(cadastrosCol, where("numero_cadastro_prefixo", "==", prefixo));
  
  // Esta consulta não usa orderBy (para evitar erros de índice)
  const snapshot = await getDocs(q);
  
  let maxSequential = 0;
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.numero_cadastro) {
        // Extrai a parte sequencial (os últimos 4 dígitos)
        const parts = data.numero_cadastro.split('-');
        if (parts.length === 4) {
            const seq = parseInt(parts[3], 10);
            if (!isNaN(seq) && seq > maxSequential) {
                maxSequential = seq;
            }
        }
    }
  });

  const nextSequential = maxSequential + 1;
  const sequentialPadded = String(nextSequential).padStart(4, '0');

  // ID Final: 2025-GOS-VLB0-0001
  return {
    id: `${prefixo}-${sequentialPadded}`,
    prefixo: prefixo
  };
};


// =================================================================
// 2. COMPONENTE DE CADASTRO MESTRE (MODAL)
// =================================================================

const MasterFormModal = ({ masterType, municipios, userId, isAuthReady, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [novoMun, setNovoMun] = useState({ nome: '', codigo_sigla: '' });
    const [novoLot, setNovoLot] = useState({ nome_nucleo: '', codigo_nucleo: '', id_municipio_fk: '' });

    const handleMasterChange = (e, type) => {
        const { name, value } = e.target;
        if (type === 'municipio') {
            setNovoMun(prev => ({ ...prev, [name]: name === 'codigo_sigla' ? value.substring(0, 3).toUpperCase() : value }));
        } else if (type === 'loteamento') {
            setNovoLot(prev => ({ ...prev, [name]: name === 'codigo_nucleo' ? value.substring(0, 4).toUpperCase() : value }));
        }
    };

    const handleMasterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!isAuthReady || !userId) {
            setError("Autenticação não concluída. Tente novamente.");
            return;
        }
        
        setIsLoading(true);
        try {
            if (masterType === 'municipio') {
                if (!novoMun.nome || !novoMun.codigo_sigla) throw new Error("Preencha todos os campos do município.");
                await addDoc(getPublicCollection('municipios'), {
                    ...novoMun,
                    codigo_sigla: novoMun.codigo_sigla.toUpperCase(),
                    ativo: true,
                    createdAt: new Date(),
                    createdBy: userId
                });
                onSuccess(`Município ${novoMun.nome} cadastrado com sucesso!`);
            } else if (masterType === 'loteamento') {
                if (!novoLot.nome_nucleo || !novoLot.codigo_nucleo || !novoLot.id_municipio_fk) throw new Error("Preencha todos os campos do loteamento.");
                await addDoc(getPublicCollection('loteamentos'), {
                    ...novoLot,
                    codigo_nucleo: novoLot.codigo_nucleo.toUpperCase(),
                    ativo: true,
                    createdAt: new Date(),
                    createdBy: userId
                });
                onSuccess(`Loteamento ${novoLot.nome_nucleo} cadastrado com sucesso!`);
            }
            onClose();
        } catch (err) {
            console.error("Erro ao cadastrar mestre:", err);
            setError(`Erro ao cadastrar: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-sky-800">
                    {masterType === 'municipio' ? 'Novo Município' : 'Novo Loteamento/Núcleo'}
                </h3>
                {error && <p className="bg-red-100 p-3 rounded text-red-700 mb-4">{error}</p>}
                
                <form onSubmit={handleMasterSubmit} className="space-y-4">
                    {masterType === 'municipio' && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block">Nome do Município (Ex: COLINAS DO SUL-GO)</label>
                                <input type="text" name="nome" value={novoMun.nome} 
                                       onChange={(e) => handleMasterChange(e, 'municipio')} 
                                       className="w-full p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block">Código/Sigla para ID (Ex: GOS)</label>
                                <input type="text" name="codigo_sigla" value={novoMun.codigo_sigla} 
                                       onChange={(e) => handleMasterChange(e, 'municipio')} 
                                       className="w-full p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500 uppercase" maxLength={3} required />
                            </div>
                        </>
                    )}

                    {masterType === 'loteamento' && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block">Município Vinculado</label>
                                <select name="id_municipio_fk" value={novoLot.id_municipio_fk} 
                                        onChange={(e) => handleMasterChange(e, 'loteamento')} 
                                        className="w-full p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500" required>
                                    <option value="">Selecione um Município</option>
                                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block">Nome do Núcleo Urbano/Loteamento (Ex: DISTRITO DE VILA BORBA)</label>
                                <input type="text" name="nome_nucleo" value={novoLot.nome_nucleo} 
                                       onChange={(e) => handleMasterChange(e, 'loteamento')} 
                                       className="w-full p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block">Código para ID (Máx. 4 caracteres, Ex: VLB0)</label>
                                <input type="text" name="codigo_nucleo" value={novoLot.codigo_nucleo} 
                                       onChange={(e) => handleMasterChange(e, 'loteamento')} 
                                       className="w-full p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500 uppercase" maxLength={4} required />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={onClose} disabled={isLoading}
                                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                        <button type="submit" disabled={isLoading}
                                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:bg-sky-400">
                            {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// =================================================================
// 3. COMPONENTES DAS ETAPAS (EXTRAÍDOS PARA CORRIGIR O FOCO)
// =================================================================

const Etapa1Form = ({ form, municipios, loteamentosFiltrados, handleChange, nextStep, setShowMasterForm, setMasterType }) => (
    <>
      <h2 className="text-2xl font-bold text-sky-800 mb-4">Etapa 1: Localização e Referência</h2>
      
      {/* Seleção e Cadastro de Município */}
      <div className="mb-4 p-4 border rounded-xl bg-sky-50/50">
          <label className="font-semibold text-sky-700 block mb-2">Município</label>
          <div className="flex items-center space-x-3">
              <select name="id_municipio_fk" value={form.id_municipio_fk} onChange={handleChange} 
                      className="flex-grow p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500" required>
                  <option value="">Selecione o Município</option>
                  {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <button type="button" onClick={() => { setMasterType('municipio'); setShowMasterForm(true); }}
                      className="bg-sky-500 text-white p-2 rounded-lg hover:bg-sky-600 transition text-sm whitespace-nowrap">
                  + Novo Município
              </button>
          </div>
      </div>
      
      {/* Seleção e Cadastro de Loteamento */}
      <div className="mb-6 p-4 border rounded-xl bg-sky-50/50">
          <label className="font-semibold text-sky-700 block mb-2">Núcleo Urbano Informal/Loteamento</label>
          <div className="flex items-center space-x-3">
              <select name="id_loteamento_fk" value={form.id_loteamento_fk} onChange={handleChange} 
                      className="flex-grow p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500"
                      disabled={!form.id_municipio_fk} required>
                  <option value="">Selecione o Loteamento</option>
                  {loteamentosFiltrados.map(l => <option key={l.id} value={l.id}>{l.nome_nucleo}</option>)}
              </select>
              <button type="button" onClick={() => { setMasterType('loteamento'); setShowMasterForm(true); }}
                      className="bg-sky-500 text-white p-2 rounded-lg hover:bg-sky-600 transition text-sm whitespace-nowrap"
                      disabled={!form.id_municipio_fk}>
                  + Novo Loteamento
              </button>
          </div>
          {!form.id_municipio_fk && <p className="text-sm text-red-500 mt-1">Selecione um município para cadastrar um loteamento.</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadra/Lote */}
        <div>
            <label className="text-sm font-medium text-gray-700 block">Quadra e Lote (Ex: Quadra 08 Lote 03)</label>
            <input type="text" name="quadra_lote" value={form.quadra_lote} onChange={handleChange} 
                   className="w-full p-2 border rounded-lg" required />
        </div>
        {/* Área m² */}
        <div>
            <label className="text-sm font-medium text-gray-700 block">Área (m²)</label>
            <input type="number" name="area_m2" value={form.area_m2} onChange={handleChange} 
                   className="w-full p-2 border rounded-lg" required />
        </div>
      </div>
      
      {/* Endereço Completo */}
      <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block">Endereço Completo</label>
          <textarea name="endereco_completo" value={form.endereco_completo} onChange={handleChange} 
                    rows="3" className="w-full p-2 border rounded-lg" required />
      </div>

      <div className="flex justify-end mt-6">
          <button type="button" onClick={nextStep} 
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:bg-gray-400"
                  disabled={!form.id_municipio_fk || !form.id_loteamento_fk}>
              Próxima Etapa (Ocupante)
          </button>
      </div>
    </>
);

const Etapa2Form = ({ form, handleChange, nextStep, prevStep }) => (
    <>
      <h2 className="text-2xl font-bold text-sky-800 mb-4">Etapa 2: Dados do Ocupante Principal</h2>
      
      {/* Nome e CPF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label className="text-sm font-medium text-gray-700 block">Nome Completo</label>
            <input type="text" name="nome" value={form.nome} onChange={handleChange} 
                   className="w-full p-2 border rounded-lg" required />
        </div>
        <div>
            <label className="text-sm font-medium text-gray-700 block">CPF</label>
            <input type="text" name="cpf" value={form.cpf} onChange={handleChange} 
                   className="w-full p-2 border rounded-lg" maxLength={14} required />
        </div>
      </div>
      
      {/* Data Nasc. e Renda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label className="text-sm font-medium text-gray-700 block">Data de Nascimento</label>
            <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} 
                   className="w-full p-2 border rounded-lg" required />
        </div>
        <div>
            <label className="text-sm font-medium text-gray-700 block">Renda Mensal (R$)</label>
            <input type="number" name="renda_mensal" value={form.renda_mensal} onChange={handleChange} 
                   className="w-full p-2 border rounded-lg" required />
        </div>
      </div>

      {/* Estado Civil e Aquisição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label className="text-sm font-medium text-gray-700 block">Estado Civil</label>
            <select name="estado_civil" value={form.estado_civil} onChange={handleChange} 
                    className="w-full p-2 border rounded-lg">
                <option value="Solteiro">Solteiro</option>
                <option value="Casado">Casado</option>
                <option value="UniaoEstavel">União Estável</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viuvo">Viúvo</option>
            </select>
        </div>
        <div>
            <label className="text-sm font-medium text-gray-700 block">Forma de Aquisição</label>
            <select name="forma_aquisicao" value={form.forma_aquisicao} onChange={handleChange} 
                    className="w-full p-2 border rounded-lg">
                <option value="Compra e venda particular/recibo">Compra e venda particular/recibo</option>
                <option value="Herança de inventário">Herança de inventário</option>
                <option value="Doação particular/recibo">Doação particular/recibo</option>
                <option value="Outro">Outro</option>
            </select>
        </div>
      </div>
      
      {/* Botões */}
      <div className="flex justify-between mt-6">
          <button type="button" onClick={prevStep} className="px-6 py-2 text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50 transition">
              Voltar (Localização)
          </button>
          <button type="button" onClick={nextStep} className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">
              Próxima Etapa (Declarações)
          </button>
      </div>
    </>
);

const Etapa3Form = ({ form, handleChange, handleSubmitCadastro, prevStep, isLoading }) => (
    <>
      <h2 className="text-2xl font-bold text-sky-800 mb-4">Etapa 3: Declarações e Enquadramento</h2>

      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-700">Declarações (Obrigatórias conforme ficha REURB)</h3>
        {/* Declaração de Veracidade */}
        <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input type="checkbox" name="decl_veracidade" checked={form.decl_veracidade} onChange={handleChange} 
                   className="form-checkbox h-5 w-5 text-sky-600 rounded" required />
            <span className="text-sm text-gray-700">As informações prestadas são verdadeiras e correspondem à realidade (sob pena de falsidade ideológica).</span>
        </label>
        {/* Declaração de Não Propriedade */}
        <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input type="checkbox" name="decl_nao_proprietario" checked={form.decl_nao_proprietario} onChange={handleChange} 
                   className="form-checkbox h-5 w-5 text-sky-600 rounded" required />
            <span className="text-sm text-gray-700">Não sou proprietário(a) exclusivo(a) de outro imóvel urbano ou rural.</span>
        </label>
        {/* Declaração de Anuência */}
        <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input type="checkbox" name="decl_anuencia_medidas" checked={form.decl_anuencia_medidas} onChange={handleChange} 
                   className="form-checkbox h-5 w-5 text-sky-600 rounded" required />
            <span className="text-sm text-gray-700">Manifesto anuência em relação às medidas, limites e confrontações do meu imóvel.</span>
        </label>
      </div>

      <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Enquadramento REURB</h3>
          <div className="flex space-x-6">
              <label className="inline-flex items-center">
                  <input type="radio" name="tipo_reurb" value="Reurb-S" checked={form.tipo_reurb === 'Reurb-S'} onChange={handleChange} 
                         className="form-radio h-4 w-4 text-sky-600" />
                  <span className="ml-2 text-gray-700">Reurb-S</span>
              </label>
              <label className="inline-flex items-center">
                  <input type="radio" name="tipo_reurb" value="Reurb-E" checked={form.tipo_reurb === 'Reurb-E'} onChange={handleChange} 
                         className="form-radio h-4 w-4 text-sky-600" />
                  <span className="ml-2 text-gray-700">Reurb-E</span>
              </label>
          </div>
      </div>
      
      {/* Botões */}
      <div className="flex justify-between mt-6">
          <button type="button" onClick={prevStep} className="px-6 py-2 text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50 transition">
              Voltar (Ocupante)
          </button>
          <button type="submit" onClick={handleSubmitCadastro} disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400">
              {isLoading ? 'Salvando Cadastro...' : 'Finalizar e Gerar ID'}
          </button>
      </div>
    </>
);

const Etapa4Result = ({ message, handleSendGovBrLink, handleManualUpload, setEtapa, isLoading, error }) => (
    <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Cadastro Finalizado!</h2>
        <p className="text-lg text-gray-600 mb-4">{message}</p>
        <p className="text-gray-500 mb-6">O documento PDF para assinatura foi gerado.</p>

        {error && <p className="bg-red-100 p-3 rounded-xl text-red-700 mb-4">{error}</p>}

        <h3 className="text-xl font-semibold text-sky-700 mb-3">Próximo Passo: Assinatura</h3>
        
        {/* Opção A: Gov.br */}
        <div className="mb-4 p-4 border border-sky-300 rounded-lg bg-sky-50">
            <p className="font-medium mb-2">Opção 1: Assinatura Digital (Recomendado)</p>
            <button onClick={handleSendGovBrLink} disabled={isLoading}
                    className="w-full py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:bg-gray-400">
                Enviar Link para Assinatura GOV.BR
            </button>
        </div>

        {/* Opção B: Manual */}
        <div className="p-4 border border-gray-300 rounded-lg">
            <p className="font-medium mb-2">Opção 2: Assinatura Manual</p>
            <p className="text-sm text-gray-600 mb-3">Imprima, assine, reconheça firma e anexe o documento digitalizado.</p>
            <input type="file" accept="application/pdf,image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"/>
            <button onClick={handleManualUpload} disabled={isLoading}
                    className="mt-3 w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400">
                Anexar Ficha Assinada (Manual)
            </button>
        </div>
        
        <button onClick={() => setEtapa(1)} className="mt-8 text-sky-600 hover:underline">
            Novo Cadastro
        </button>
    </div>
);

const Etapa5Complete = ({ setEtapa }) => (
    <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        <h2 className="text-2xl font-bold text-green-700 mb-4">Processo de Assinatura Iniciado/Concluído.</h2>
        <p className="text-lg text-gray-600 mb-6">O cadastro está agora sob revisão. Status final registrado no sistema.</p>
        <button onClick={() => setEtapa(1)} className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">
            Iniciar Novo Cadastro
        </button>
    </div>
);


// =================================================================
// 4. COMPONENTE NOVO CADASTRO (LÓGICA PRINCIPAL)
// =================================================================

const NovoCadastro = ({ municipios, loteamentos, userId, isAuthReady }) => {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState({
    // Parte A - Localização e Referência
    id_municipio_fk: '',
    id_loteamento_fk: '',
    quadra_lote: '',
    area_m2: 0, 
    endereco_completo: '',
    // Parte B - Ocupante Principal (Simplificado para o exemplo)
    nome: '',
    cpf: '',
    data_nascimento: '',
    estado_civil: 'Solteiro',
    renda_mensal: 0, 
    // Parte C - Declarações (Baseado na ficha PDF)
    decl_veracidade: false,
    decl_nao_proprietario: false,
    decl_anuencia_medidas: false,
    tipo_reurb: 'Reurb-S',
    forma_aquisicao: 'Compra e venda particular/recibo',
    // Controle
    status_assinatura: 'Pendente',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Estados para Modal Mestre
  const [showMasterForm, setShowMasterForm] = useState(false);
  const [masterType, setMasterType] = useState(null); 

  // Função estática para lidar com o estado principal
  // Esta função é o segredo para corrigir o problema de perda de foco
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    let newValue;
    if (type === 'checkbox') {
        newValue = checked;
    } else if (name === 'area_m2' || name === 'renda_mensal') {
        // Garante que números sejam números, mas aceita string vazia momentaneamente
        newValue = parseFloat(value) || (value === '' ? '' : 0);
    } else {
        newValue = value;
    }

    // Usa a forma funcional de setForm
    setForm(prevForm => ({
        ...prevForm,
        [name]: newValue
    }));
  }, []); // Dependency array is empty

  // Filtra loteamentos baseado no município selecionado
  const loteamentosFiltrados = useMemo(() => {
    return loteamentos.filter(l => l.id_municipio_fk === form.id_municipio_fk);
  }, [loteamentos, form.id_municipio_fk]);

  // Limpa mensagens ao mudar de etapa
  const nextStep = useCallback(() => { 
    setMessage('');
    setError('');
    setEtapa(prev => prev + 1); 
  }, []);

  const prevStep = useCallback(() => { 
    setMessage('');
    setError('');
    setEtapa(prev => prev - 1); 
  }, []);
  
  // Função de sucesso do Modal Mestre
  const handleMasterSuccess = useCallback((msg) => {
    setMessage(msg);
  }, [setMessage]);

  
  // =================================================================
  // LÓGICA DE CADASTRO DO OCUPANTE
  // =================================================================

  const handleSubmitCadastro = async (e) => {
    e.preventDefault();
    if (!isAuthReady || !userId) {
        setError("Autenticação não concluída. Tente novamente.");
        return;
    }

    if (!form.id_municipio_fk || !form.id_loteamento_fk) {
      setError("Selecione o Município e o Loteamento.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Gerar o ID Sequencial
      const { id: numero_cadastro, prefixo: numero_cadastro_prefixo } = await generateCadastroId(
        form.id_loteamento_fk, municipios, loteamentos
      );

      // 2. Preparar dados (Converte valores vazios/null para 0 para Firestore)
      const dadosCadastro = {
        ...form,
        area_m2: parseFloat(form.area_m2) || 0,
        renda_mensal: parseFloat(form.renda_mensal) || 0,
        numero_cadastro,
        numero_cadastro_prefixo, // Campo auxiliar para consultas eficientes
        createdAt: new Date(),
        createdBy: userId,
        status_assinatura: 'Pendente',
      };

      // 3. Salvar no Firestore
      const docRef = await addDoc(getPublicCollection('cadastros'), dadosCadastro);

      // 4. Limpar e mostrar sucesso
      const generatedMessage = `Cadastro concluído! ID gerado: ${numero_cadastro}`;
      setForm({
        id_municipio_fk: '', id_loteamento_fk: '', quadra_lote: '', area_m2: 0, endereco_completo: '',
        nome: '', cpf: '', data_nascimento: '', estado_civil: 'Solteiro', renda_mensal: 0,
        decl_veracidade: false, decl_nao_proprietario: false, decl_anuencia_medidas: false,
        tipo_reurb: 'Reurb-S', forma_aquisicao: 'Compra e venda particular/recibo', status_assinatura: 'Pendente',
      });
      setEtapa(4); // Mover para a etapa de Assinatura/Conclusão
      setMessage(generatedMessage);
      
    } catch (err) {
      console.error("Erro ao cadastrar ocupante:", err);
      setError(`Falha ao salvar o cadastro: ${err.message}.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // =================================================================
  // LÓGICA DE ASSINATURA (PLACEHOLDER)
  // =================================================================

  // Função simulada para enviar link Gov.br
  const handleSendGovBrLink = useCallback(async () => {
    if (!message.includes('ID gerado')) {
        setError("Salve o cadastro antes de enviar o link de assinatura.");
        return;
    }
    
    const linkSimulado = `https://assinador.gov.br/doc/${Math.random().toString(36).substring(2, 10)}`;
    setMessage(`Link para assinatura Gov.br enviado para o e-mail do ocupante: ${linkSimulado} (Ação simulada)`);
    setEtapa(5); // Conclusão final
  }, [message]);
  
  // Função para simular Upload Manual
  const handleManualUpload = useCallback(() => {
    setMessage("Documento assinado manualmente anexado e cadastro finalizado. (Ação simulada)");
    setEtapa(5); // Conclusão final
  }, []);

  // =================================================================
  // ESTRUTURA DE ETAPAS DO FORMULÁRIO (Componentes externos)
  // =================================================================
  
  // Renderiza a etapa atual
  const RenderEtapa = () => {
      switch (etapa) {
          case 1:
              return <Etapa1Form 
                form={form} 
                municipios={municipios} 
                loteamentosFiltrados={loteamentosFiltrados} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                setShowMasterForm={setShowMasterForm} 
                setMasterType={setMasterType}
            />;
          case 2:
              return <Etapa2Form 
                form={form} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                prevStep={prevStep} 
            />;
          case 3:
              return <Etapa3Form 
                form={form} 
                handleChange={handleChange} 
                handleSubmitCadastro={handleSubmitCadastro} 
                prevStep={prevStep} 
                isLoading={isLoading}
            />;
          case 4:
              return <Etapa4Result 
                message={message} 
                handleSendGovBrLink={handleSendGovBrLink} 
                handleManualUpload={handleManualUpload} 
                setEtapa={setEtapa} 
                isLoading={isLoading}
                error={error}
            />;
          case 5:
              return <Etapa5Complete 
                setEtapa={setEtapa} 
            />;
          default:
              return <Etapa1Form 
                form={form} 
                municipios={municipios} 
                loteamentosFiltrados={loteamentosFiltrados} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                setShowMasterForm={setShowMasterForm} 
                setMasterType={setMasterType}
            />;
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-extrabold text-sky-800 mb-6">Novo Cadastro REURB</h1>
        
        {/* Indicador de Etapa */}
        <div className="mb-8 flex justify-between items-center text-center">
            {['Localização', 'Ocupante', 'Declarações', 'Assinatura'].map((title, index) => (
                <div key={index} className={`flex-1 ${index < etapa - 1 ? 'text-green-500' : index === etapa - 1 ? 'text-sky-600 font-bold' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${index < etapa - 1 ? 'bg-green-100' : index === etapa - 1 ? 'bg-sky-100 border-2 border-sky-600' : 'bg-gray-100'}`}>
                        {index + 1}
                    </div>
                    <span className="text-sm hidden sm:inline">{title}</span>
                </div>
            ))}
        </div>
        
        {/* Mensagens de Feedback */}
        {error && <p className="bg-red-100 p-3 rounded-xl text-red-700 mb-6">{error}</p>}
        {message && etapa < 4 && <p className="bg-sky-100 p-3 rounded-xl text-sky-700 mb-6">{message}</p>}

        {/* A tag form agora envolve a chamada do componente de etapa para lidar com o submit da Etapa 3 */}
        <form onSubmit={e => e.preventDefault()} className="bg-white p-8 rounded-2xl shadow-xl">
            {RenderEtapa()}
        </form>

        {/* Renderiza o Modal Mestre FORA da área principal do formulário */}
        {showMasterForm && (
            <MasterFormModal
                masterType={masterType}
                municipios={municipios}
                userId={userId}
                isAuthReady={isAuthReady}
                onClose={() => setShowMasterForm(false)}
                onSuccess={handleMasterSuccess}
            />
        )}
    </div>
  );
};


// =================================================================
// 5. COMPONENTE APP PRINCIPAL
// =================================================================

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [page, setPage] = useState("novo"); // Estado da navegação: Alterado para 'novo' para testes
  
  // Estados para Master Data
  const [municipios, setMunicipios] = useState([]);
  const [loteamentos, setLoteamentos] = useState([]);
  const [userId, setUserId] = useState(null);
  
  // Função para obter o usuário
  const getUserId = (currentUser) => currentUser?.uid || crypto.randomUUID();

  // ----------------------------------------------------------------
  // FUNÇÕES DE SETUP E AUTENTICAÇÃO
  // ----------------------------------------------------------------
  useEffect(() => {
    // 1. Setup inicial de autenticação
    const setupAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Erro ao autenticar:", err);
        signInAnonymously(auth); // Tenta anonimamente se o token falhar
      }
    };

    // 2. Listener de estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setUserId(getUserId(usr));
      setIsAuthReady(true);
      setLoading(false);
    });
    
    // Inicia o processo de autenticação (só na primeira vez)
    if (!isAuthReady) {
        setupAuth();
    }

    return () => unsubscribe(); // Cleanup
  }, [isAuthReady]);

  // ----------------------------------------------------------------
  // LISTENERS DE MASTER DATA (Firestore)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    // Listener para Municípios
    const unsubscribeMun = onSnapshot(getPublicCollection('municipios'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMunicipios(data);
    }, (error) => {
      console.error("Erro ao carregar municípios:", error);
    });

    // Listener para Loteamentos
    const unsubscribeLot = onSnapshot(getPublicCollection('loteamentos'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoteamentos(data);
    }, (error) => {
      console.error("Erro ao carregar loteamentos:", error);
    });

    return () => {
      unsubscribeMun();
      unsubscribeLot();
    };
  }, [isAuthReady, userId]); // Depende da conclusão da autenticação

  // Placeholder para Sidebar (simplificado para App.jsx)
  const Sidebar = ({ page, setPage, logout }) => (
    // Alterado para 'flex flex-col' e removido o 'space-y-4' da nav principal
    <nav className="sidebar bg-sky-800 text-white w-64 fixed h-full p-6 shadow-2xl flex flex-col">
      <h1 className="text-2xl font-bold mb-8 border-b border-sky-700 pb-4">REURB System</h1>
      <p className="text-xs text-gray-400 mb-6">Usuário ID: {userId}</p>
      
      {/* Novo div com espaçamento mais compacto para os itens do menu: space-y-2 */}
      <div className="space-y-2">
        {['dashboard', 'novo', 'consultar', 'relatorios', 'tickets', 'config'].map((p) => (
          <button key={p} onClick={() => setPage(p)}
                  className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition ${page === p ? 'bg-sky-600 font-semibold' : 'hover:bg-sky-700'}`}>
            <span className="capitalize">{p.replace('novo', 'Novo Cadastro')}</span>
          </button>
        ))}
      </div>
      
      {/* Este div usa flex-grow para ocupar todo o espaço restante e empurrar o Sair para o fundo */}
      <div className="flex-grow"></div> 

      <button onClick={() => signOut(auth)} className="w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-red-700 bg-red-600 transition">
        Sair
      </button>
    </nav>
  );

  // Placeholder para LoginScreen (integrado com o fluxo anterior)
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
      <div className="flex justify-center items-center h-screen w-full bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-sky-800 mb-6 text-center">
            Acesso ao Sistema REURB
          </h1>

          {error && <p className="bg-red-100 p-3 rounded text-red-600 mb-4">{error}</p>}
          {message && <p className="bg-sky-100 p-3 rounded text-sky-700 mb-4">{message}</p>}

          <form className="space-y-4" onSubmit={login}>
            <div>
              <label className="text-sm text-gray-600 block">E-mail</label>
              <input
                type="email"
                className="w-full p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block">Senha</label>
              <input
                type="password"
                className="w-full p-2 border rounded-lg focus:ring-sky-500 focus:border-sky-500"
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
            className="text-sm text-sky-600 mt-4 w-full text-center hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>
      </div>
    );
  };
  
  // Placeholders para outras páginas
  const PagePlaceholder = ({ title }) => (
    // Adicionado bg-white, h-full e rounded-xl para dar o aspecto de "página" dentro da área cinza.
    <div className="bg-white p-8 rounded-xl shadow-lg min-h-[calc(100vh-64px)]">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="mt-4 text-gray-600">Conteúdo da página {title} virá aqui.</p>
    </div>
  );

  // Se estiver carregando login
  if (loading) return <div className="p-8 text-center text-xl">Carregando Sistema...</div>;

  // Se NÃO estiver logado → mostrar login
  if (!user) return <LoginScreen />;

  // Se logado → sistema normal
  return (
    <div className="app flex min-h-screen">
      <Sidebar page={page} setPage={setPage} userId={userId} />

      <main className="authenticated flex-grow p-8 bg-gray-50 ml-64">
        {page === "dashboard" && <PagePlaceholder title="Dashboard" />}
        {page === "novo" && <NovoCadastro 
            municipios={municipios} 
            loteamentos={loteamentos} 
            userId={userId} 
            isAuthReady={isAuthReady} 
        />}
        {page === "consultar" && <PagePlaceholder title="Consultar Cadastros" />}
        {page === "relatorios" && <PagePlaceholder title="Relatórios" />}
        {page === "tickets" && <PagePlaceholder title="Tickets" />}
        {page === "config" && <PagePlaceholder title="Configurações" />}
      </main>
    </div>
  );
};

export default App;
