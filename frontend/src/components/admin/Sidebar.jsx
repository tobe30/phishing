import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  RefreshCcw,
  ShieldAlert,
  Users,
  Satellite,
  Users2,
  Send,
  GraduationCap,
  FileBarChart,
  LayoutTemplate,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navSections = [
  {
    title: "OVERVIEW",
    items: [
      {
        to: "/dashboard",
        icon: FileText,
        label: "Dashboard",
      },
      {
        to: "/campaigns",
        icon: Send,
        label: "Campaigns",
      },
      {
        to: "/templates",
        icon: LayoutTemplate,
        label: "Templates",
      },
      {
        to: "/employees",
        icon: Users2,
        label: "Employees",
      },
      {
        to: "/training",
        icon: GraduationCap,
        label: "Training",
      },
     
    ],
  },
  {
    title: "SYSTEM",
    items: [
       {
        to: "/reports",
        icon: FileBarChart,
        label: "Reports",
      },
      {
        to: "/settings",
        icon: Settings,
        label: "Settings",
      },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Overlay (mobile only) */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-14 sm:top-16 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          top-14 sm:top-16 lg:top-0
          left-0
          z-40

          h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]

          bg-white
          border-r border-gray-200

          transition-all duration-300 ease-in-out

          ${collapsed ? "w-20" : "w-72"}
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* IMPORTANT FIX: min-h-0 prevents overflow bugs */}
        <div className="flex flex-col h-full min-h-0">

          {/* NAVIGATION */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto min-h-0">
            <div className="space-y-5">
              {navSections.map((section) => (
                <div key={section.title}>
                  {!collapsed && (
                    <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                      {section.title}
                    </p>
                  )}

                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end
                        onClick={onClose}
                        className={({ isActive }) =>
                          `
                          flex items-center justify-between

                          ${collapsed ? "px-2 justify-center" : "px-4"}

                          py-2.5 rounded-xl
                          transition-all duration-200

                          ${
                            isActive
                              ? "bg-sky-500 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }
                        `
                        }
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 shrink-0" />

                          {!collapsed && (
                            <span className="font-medium text-[14px] whitespace-nowrap">
                              {item.label}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* COLLAPSE BUTTON (ALWAYS FIXED AT BOTTOM) */}
          <div className="p-3 border-t border-gray-200 mt-auto">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`
  flex items-center w-full
  ${collapsed ? "justify-center" : "justify-start gap-2"}

  py-2.5 px-3 rounded-xl
  text-gray-500
  hover:bg-gray-100
  hover:text-gray-900
  transition-all duration-200
`}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium text-sm">
                    Collapse
                  </span>
                </>
              )}
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
