import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("phishguard-theme", nextTheme);
    setTheme(nextTheme);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-5 right-5 z-[100] inline-flex h-11 w-11 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content shadow-xl transition hover:scale-105 hover:bg-base-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
