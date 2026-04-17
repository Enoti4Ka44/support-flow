/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { TicketListPage } from "./pages/TicketListPage";
import { CreateTicketPage } from "./pages/CreateTicketPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  NotepadText,
  FilePlusIcon,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Дашборд", icon: <LayoutDashboard /> },
  { path: "/tickets", label: "Заявки", icon: <NotepadText /> },
  { path: "/tickets/new", label: "Новая", icon: <FilePlusIcon /> },
];

function NavItem({
  path,
  label,
  icon,
  isCollapsed = false,
  onClick,
}: {
  path: string;
  label: string;
  icon: ReactNode;
  isCollapsed?: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive =
    location.pathname === path ||
    (path === "/tickets" && location.pathname === "/");

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center font-medium gap-3 px-[12px] py-[10px] rounded-lg text-[14px] cursor-pointer transition-all ${
        isActive
          ? "bg-accent/10 text-accent font-medium"
          : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
      }`}
      title={isCollapsed ? label : undefined}
    >
      <span className="text-lg">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg-main text-text-primary overflow-hidden font-sans w-full relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border-dark bg-bg-sidebar absolute top-0 w-full z-20">
          <Link
            to="/tickets"
            className="flex items-center gap-2 text-[18px] font-bold tracking-tight"
          >
            <div className="w-6 h-6 bg-accent rounded-md shrink-0 flex items-center justify-center text-[10px]">
              ✨
            </div>
            SupportFlow
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-secondary hover:text-text-primary"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Desktop / Mobile Sidebar */}
        <aside
          className={`
            fixed md:relative top-[65px] md:top-0 h-[calc(100vh-65px)] md:h-screen
            ${isSidebarCollapsed ? "w-[100px]" : "w-[240px]"} 
            shrink-0 bg-bg-sidebar border-r border-border-dark p-4 md:p-6 flex flex-col gap-8 
            transition-all duration-300 z-20
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div
            className={
              isSidebarCollapsed
                ? "mx-auto"
                : "flex items-center justify-between gap-2"
            }
          >
            <Link
              to="/tickets"
              className={`flex items-center gap-2 font-bold tracking-tight overflow-hidden whitespace-nowrap transition-all ${isSidebarCollapsed ? "hidden" : "w-auto opacity-100 text-[18px]"}`}
            >
              <div className="w-6 h-6 bg-accent rounded-md shrink-0 flex items-center justify-center text-[10px]">
                ✨
              </div>
              SupportFlow AI
            </Link>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex text-text-secondary hover:text-white p-1 rounded-md hover:bg-white/10 shrink-0"
              title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
            >
              {isSidebarCollapsed ? (
                <PanelLeft size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavItem
                    {...item}
                    isCollapsed={isSidebarCollapsed}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col px-4 md:px-6 py-4 md:py-6 mt-[65px] md:mt-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
