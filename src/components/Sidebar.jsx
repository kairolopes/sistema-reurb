import { Home, FilePlus, Search, FileText, Ticket, Settings, LogOut } from "lucide-react";

const Sidebar = ({ page, setPage, logout }) => {
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <Home /> },
    { id: "novo", label: "Novo Cadastro", icon: <FilePlus /> },
    { id: "consultar", label: "Consultar", icon: <Search /> },
    { id: "relatorios", label: "Relatórios", icon: <FileText /> },
    { id: "tickets", label: "Tickets", icon: <Ticket /> },
    { id: "config", label: "Configurações", icon: <Settings /> },
  ];

  return (
    <aside className="sidebar">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span role="img" aria-label="building">🏛️</span>
        REURB
      </h1>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              page === item.id ? "active" : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Botão Sair */}
      <div className="mt-auto pt-6">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 rounded-lg w-full bg-red-600 text-white hover:bg-red-700 transition"
        >
          <LogOut /> Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
