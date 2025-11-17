import { Building, Plus, FileText, Ticket } from "lucide-react";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-semibold text-sky-700 flex items-center">
            <Building className="w-5 h-5 mr-2" /> Prefeituras Cadastradas
          </h2>
          <p className="text-4xl font-bold mt-4">12</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-semibold text-sky-700 flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Novos Cadastros
          </h2>
          <p className="text-4xl font-bold mt-4">48</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-semibold text-sky-700 flex items-center">
            <Ticket className="w-5 h-5 mr-2" /> Tickets Pendentes
          </h2>
          <p className="text-4xl font-bold mt-4">5</p>
        </div>
      </div>
    </div>
  );
}
