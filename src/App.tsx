/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { TicketListPage } from './pages/TicketListPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

import { DashboardPage } from './pages/DashboardPage';

const navItems = [
  { path: '/dashboard', label: 'Дашборд', icon: '📊' },
  { path: '/tickets', label: 'Заявки', icon: '📋' },
  { path: '/tickets/new', label: 'Новая', icon: '➕' },
];

function NavItem({ path, label, icon }: { path: string; label: string; icon: string }) {
  const location = useLocation();
  const isActive = location.pathname === path || (path === '/tickets' && location.pathname === '/');
  
  return (
    <Link
      to={path}
      className={`flex items-center gap-2 px-[12px] py-[10px] rounded-lg text-[14px] cursor-pointer transition-all ${
        isActive 
          ? 'bg-accent/10 text-accent font-medium' 
          : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg-main text-text-primary overflow-hidden font-sans w-full">
        <aside className="w-[240px] shrink-0 bg-bg-sidebar border-r border-border-dark p-6 flex flex-col gap-8 hidden md:flex">
          <Link to="/tickets" className="flex items-center gap-2 text-[18px] font-bold tracking-tight">
            <div className="w-6 h-6 bg-accent rounded-md shrink-0 flex items-center justify-center text-[10px]">✨</div>
            SupportFlow AI
          </Link>
          
          <nav>
            <ul className="flex flex-col gap-2">
              {navItems.map(item => (
                <li key={item.path}>
                  <NavItem {...item} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col px-6 py-6 overflow-y-auto">
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
