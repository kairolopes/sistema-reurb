import { Settings } from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="p-6">

      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-7 h-7 text-[var(--primary)]" />
        <h2 className="text-2xl font-bold">Configurações</h2>
      </div>

      <div className="card shadow-lg border border-gray-200">
        <p className="opacity-80 mb-4">Ajuste opções administrativas, permissões e preferências.</p>

        <button className="w-full p-3 rounded-xl bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
          Gerenciar Usuários
        </button>

        <button className="w-full p-3 mt-3 rounded-xl bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
          Preferências do Sistema
        </button>

        <button className="w-full p-3 mt-3 rounded-xl bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
          Backup e Segurança
        </button>
      </div>

    </div>
  );
};

export default Configuracoes;
