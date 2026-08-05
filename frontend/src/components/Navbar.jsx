import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import logo from "../assets/phish-logo-transparent.png";
import { getAuthUser } from "../lib/api";

const Navbar = () => {
  const { data: authUser, isPending } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="fixed left-1/2 top-5 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
      <div className="navbar rounded-2xl border border-white/20 bg-base-100/70 px-5 py-2 shadow-lg backdrop-blur-xl">
        <div className="navbar-start">
          <Link to="/" aria-label="PhishGuard home">
            <img
              src={logo}
              alt="PhishGuard"
              className="theme-logo h-9 w-auto object-contain sm:h-10"
            />
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2 text-sm">
            <li>
              <a href="#how-it-works">How it works</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#results">Results</a>
            </li>
          </ul>
        </div>

        <div className="navbar-end">
          {isPending ? (
            <span className="loading loading-spinner loading-sm text-primary" />
          ) : (
            <Link
              to={authUser ? "/dashboard" : "/login"}
              className="btn btn-neutral rounded-full px-6"
            >
              {authUser ? "Dashboard" : "Login"}
              <ArrowRight size={17} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
