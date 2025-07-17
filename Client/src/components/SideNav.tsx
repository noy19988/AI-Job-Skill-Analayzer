import { NavLink } from "react-router-dom";
import { Bot, LayoutDashboard } from "lucide-react";

const SideNav = () => {
  return (
    <aside className="w-48 bg-gray-100 border-r h-full p-4">
      <nav className="flex flex-col space-y-2">
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/app/ai"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg transition ${
              isActive
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          <Bot className="w-5 h-5" />
          <span>AI Chat Assistant</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default SideNav;