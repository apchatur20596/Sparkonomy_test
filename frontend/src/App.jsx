import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import Invoices from './pages/Invoices.jsx';
import './index.css';
import BackgroundFX from './components/BackgroundFX.jsx';

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-backdrop-blur:backdrop-blur-md">
      <div className="container-responsive flex items-center justify-between h-14">
        <div className="text-base font-semibold tracking-tight">Sparkonomy</div>
        <div className="text-xs text-gray-500">Invoicing</div>
      </div>
    </header>
  );
}

function BottomNav() {
  const base = 'flex flex-col items-center justify-center gap-1 text-[11px]';
  const link = 'relative py-2';
  const active = 'text-primary-700 font-semibold';
  const inactive = 'text-gray-500';
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur supports-backdrop-blur:backdrop-blur-md">
      <div className="container-responsive">
        <div className="grid grid-cols-3">
          <NavLink to="/" end className={({ isActive }) => `${link} ${base} ${isActive ? active : inactive}`}>
            {({ isActive }) => (
              <div className="flex flex-col items-center">
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
                {isActive && <span className="absolute -top-[1px] h-1 w-10 rounded-full bg-primary-600" />}
              </div>
            )}
          </NavLink>
          <NavLink to="/clients" className={({ isActive }) => `${link} ${base} ${isActive ? active : inactive}`}>
            {({ isActive }) => (
              <div className="flex flex-col items-center">
                <Users size={20} />
                <span>Clients</span>
                {isActive && <span className="absolute -top-[1px] h-1 w-10 rounded-full bg-primary-600" />}
              </div>
            )}
          </NavLink>
          <NavLink to="/invoices" className={({ isActive }) => `${link} ${base} ${isActive ? active : inactive}`}>
            {({ isActive }) => (
              <div className="flex flex-col items-center">
                <FileText size={20} />
                <span>Invoices</span>
                {isActive && <span className="absolute -top-[1px] h-1 w-10 rounded-full bg-primary-600" />}
              </div>
            )}
          </NavLink>
        </div>
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BackgroundFX />
      <Header />
      <div className="pb-20 pt-2">{/* space for fixed nav */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
      <BottomNav />
    </BrowserRouter>
  );
}

export default App;
