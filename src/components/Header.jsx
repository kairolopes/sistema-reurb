import { Sun, Moon, LogOut } from "lucide-react";

const Header = ({ userEmail, onLogout, theme, toggleTheme }) => {
  return (
    <header className="header w-full flex items-center justify-between p-4 rounded-xl shadow-sm mb-6">
      <h1 className="text-2xl font-bold flex items-center" style={{ color: "var(--primary)" }}>
        Sistema REURB
      </h1>

      <div className="flex items-center gap-4">

        {/* Email */}
        <span className="text-sm opacity-75 hidden sm:block">{userEmail}</span>

        {/* Botão troca de tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition flex items-center"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
