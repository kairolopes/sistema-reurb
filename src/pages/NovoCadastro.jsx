import { FilePlus } from "lucide-react";

const NovoCadastro = () => {
  return (
    <div className="p-6">

      <div className="flex items-center gap-3 mb-6">
        <FilePlus className="w-7 h-7 text-[var(--primary)]" />
        <h2 className="text-2xl font-bold">Novo Cadastro</h2>
      </div>

      <div className="card shadow-lg border border-gray-200">

        <p className="text-sm opacity-80 mb-4">
          Nesta área você irá cadastrar ocupantes, imóveis, anexar documentos e gerar o número de cadastro único REURB.
        </p>

        <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-300 opacity-70 text-center">
          <p>⭐ Área do formulário será adicionada aqui.</p>
          <p className="text-xs opacity-60">Integração futura com IA (PDF → cadastro automático)</p>
        </div>

      </div>

    </div>
  );
};

export default NovoCadastro;
