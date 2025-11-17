import { Home, FilePlus, Search, FileText, Ticket, Settings } from "lucide-react";

const Sidebar = ({ page, setPage }) => {
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <Home /> },
    { id: "novo", label: "Novo Cadastro", icon: <FilePlus /> },
    { id: "consultar", label: "Consultar", icon: <Search /> },
    { id: "relatorios", label: "Relatórios", icon: <FileText /> },
    { id: "tickets", label: "Tickets", icon: <Ticket /> },
    { id: "config", label: "Configurações", icon: <Settings /> },
  ];

  return (
    <aside className="sidebar w-64 h-screen p-6 shadow-xl rounded-r-2xl fixed left-0 top-0">
      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition 
              ${
                page === item.id
                  ? "bg-[var(--primary)] text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            <span className="w-5 h-5">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
