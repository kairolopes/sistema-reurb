import { FilePlus, Search, FileText, Ticket, Building } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--primary)" }}>
        Dashboard Geral
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="card shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-6 h-6 text-[var(--primary)]" />
            <h3 className="font-semibold text-lg">Prefeituras Cadastradas</h3>
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm opacity-70">Total geral do sistema</p>
        </div>

        <div className="card shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FilePlus className="w-6 h-6 text-[var(--primary)]" />
            <h3 className="font-semibold text-lg">Novos Cadastros</h3>
          </div>
          <p className="text-3xl font-bold">48</p>
          <p className="text-sm opacity-70">Somente este mês</p>
        </div>

        <div className="card shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-6 h-6 text-[var(--primary)]" />
            <h3 className="font-semibold text-lg">Tickets Pendentes</h3>
          </div>
          <p className="text-3xl font-bold">5</p>
          <p className="text-sm opacity-70">Revisões solicitadas</p>
        </div>

      </div>

      <h3 className="text-xl font-semibold mt-10 mb-4">Ações rápidas</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <button className="card hover:scale-[1.02] transition shadow-md border border-gray-200 text-left">
          <FilePlus className="w-6 h-6 mb-2 text-[var(--primary)]" />
          <h4 className="font-semibold">Novo Cadastro</h4>
          <p className="text-sm opacity-70">Criar registro de ocupação</p>
        </button>

        <button className="card hover:scale-[1.02] transition shadow-md border border-gray-200 text-left">
          <Search className="w-6 h-6 mb-2 text-[var(--primary)]" />
          <h4 className="font-semibold">Consultar Registros</h4>
          <p className="text-sm opacity-70">Buscar cadastros existentes</p>
        </button>

        <button className="card hover:scale-[1.02] transition shadow-md border border-gray-200 text-left">
          <FileText className="w-6 h-6 mb-2 text-[var(--primary)]" />
          <h4 className="font-semibold">Relatórios</h4>
          <p className="text-sm opacity-70">Emitir documentos oficiais</p>
        </button>

      </div>
    </div>
  );
};

export default Dashboard;
