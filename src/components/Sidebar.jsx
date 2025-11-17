import { useState } from "react";
import { Home, FilePlus, Search, FileText, Ticket, Settings, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ page, setPage }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <Home /> },
    { id: "novo", label: "Novo Cadastro", icon: <FilePlus /> },
    { id: "consultar", label: "Consultar", icon: <Search /> },
    { id: "relatorios", label: "Relatórios", icon: <FileText /> },
    { id: "tickets", label: "Tickets", icon: <Ticket /> },
    { id: "config", label: "Configurações", icon: <Settings /> },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* BOTÃO PARA RECOLHER / EXPANDIR */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* TÍTULO */}
      {!collapsed && (
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          🏛️ REURB
        </h1>
      )}

      {/* MENU */}
      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
              page === item.id ? "active" : ""
            }`}
          >
            <span className="w-5 h-5">{item.icon}</span>

            {/* Texto some quando recolhido */}
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
