import { Home, FilePlus, Search, FileText, Ticket, Settings, LogOut, Building } from "lucide-react";

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
    <aside className="sidebar">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Building size={22} /> REURB
      </h2>

      <nav className="space-y-2">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`menu-btn ${page === item.id ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={() => console.log("logout")}
        className="menu-btn mt-10 text-red-300 hover:text-red-500"
      >
        <LogOut /> Sair
      </button>
    </aside>
  );
};

export default Sidebar;
