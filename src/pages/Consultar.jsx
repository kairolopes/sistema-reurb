import { Search } from "lucide-react";

const Consultar = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-7 h-7 text-[var(--primary)]" />
        <h2 className="text-2xl font-bold">Consultar Cadastros</h2>
      </div>

      <div className="card shadow-lg border border-gray-200">

        <p className="opacity-80 mb-4">Busque registros pelo número, CPF, nome ou loteamento.</p>

        <input
          type="text"
          placeholder="Digite algo para pesquisar..."
          className="w-full p-3 rounded-xl border border-gray-300 focus:border-[var(--primary)]"
        />

        <div className="mt-6 p-4 rounded-xl border border-dashed border-gray-300 opacity-70 text-center">
          <p>📄 Resultados da busca aparecerão aqui.</p>
          <p className="text-xs opacity-60">Listagem dinâmica futura</p>
        </div>

      </div>
    </div>
  );
};

export default Consultar;
