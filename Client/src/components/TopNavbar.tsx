import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const TopNavbar = () => {
  const [email, setEmail] = useState("user@example.com");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("email");
    if (stored) setEmail(stored);

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shortEmail = email.split("@")[0];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="w-full h-16 bg-white border-b shadow-sm flex justify-between items-center px-6 relative">
      <div className="text-xl font-bold text-indigo-600">AI Job Skill Analyzer</div>
      <div className="flex items-center space-x-4 relative" ref={menuRef}>
        <span className="text-gray-700 font-medium">Welcome, {shortEmail}</span>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-10 h-10 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <User className="w-5 h-5 text-gray-600" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 bg-white shadow-lg border rounded-md w-40 z-50">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;