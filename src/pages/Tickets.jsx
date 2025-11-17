import { Ticket } from "lucide-react";

const Tickets = () => {
  return (
    <div className="p-6">

      <div className="flex items-center gap-3 mb-6">
        <Ticket className="w-7 h-7 text-[var(--primary)]" />
        <h2 className="text-2xl font-bold">Tickets</h2>
      </div>

      <div className="card shadow-lg border border-gray-200">

        <p className="opacity-80 mb-4">
          Veja pedidos enviados por prefeituras, cartórios ou munícipes solicitando atualização ou emissão de documentos.
        </p>

        <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-300 opacity-70 text-center">
          Nenhum ticket pendente.
        </div>

      </div>

    </div>
  );
};

export default Tickets;
