import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";

import logo from "../../assets/phish-logo-transparent.png";
import avatar from "../../assets/default.jpg";
import { getAuthUser, logout } from "../../lib/api";

export default function Navbar({ onMenuClick }) {
  const [openProfile, setOpenProfile] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authResponse } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
  });

  const { mutate: logoutMutation, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      setOpenProfile(false);
      navigate("/login", { replace: true });
    },
  });

  const user = {
    organization: authResponse?.user?.organizationName || "PhishGuard",
    admin: authResponse?.user?.fullName || "Security Admin",
  };

  const handleLogout = () => {
    logoutMutation();
  };

  return (
    <header className="h-14 sm:h-16 border-b border-gray-200 bg-white px-3 sm:px-6 flex items-center justify-between shadow-sm">
      {/* LEFT */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <img
          src={logo}
          alt="PhishGuard Logo"
          className="theme-logo w-24 sm:w-28 md:w-32 h-auto object-contain"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 relative">
        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-gray-100 transition"
          >
            <img
              src={avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />

            <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  {user.organization}
                </p>

                <p className="text-xs text-gray-500">
                  {user.admin}
                </p>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition rounded-b-xl"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
