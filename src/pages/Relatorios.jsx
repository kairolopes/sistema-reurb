import { FileText } from "lucide-react";

const Relatorios = () => {
  return (
    <div className="p-6">

      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-7 h-7 text-[var(--primary)]" />
        <h2 className="text-2xl font-bold">Relatórios</h2>
      </div>

      <div className="card shadow-lg border border-gray-200">
        <p className="mb-4 opacity-80">
          Gere relatórios para Prefeituras, Cartórios, Ministério Público e outros órgãos.
        </p>

        <button className="w-full p-3 mt-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)]">
          Emitir Relatório Geral
        </button>

        <button className="w-full p-3 mt-4 rounded-xl bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
          Emitir Relatório de Loteamento
        </button>

        <button className="w-full p-3 mt-4 rounded-xl bg-gray-200 dark:bg-gray-700 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
          Emitir Relatório Personalizado
        </button>
      </div>

    </div>
  );
};

export default Relatorios;
