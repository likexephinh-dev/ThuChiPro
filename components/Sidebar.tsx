
import React, { SetStateAction } from 'react';
import { DashboardIcon, ReportsIcon, SettingsIcon } from './icons';

interface SidebarProps {
  activeView: 'dashboard' | 'reports';
  setActiveView: (view: 'dashboard' | 'reports') => void;
  isSidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<SetStateAction<boolean>>;
  onOpenCategoryModal: () => void;
}

const NavLink = ({ 
    icon, 
    label, 
    isActive, 
    onClick 
}: { 
    icon: React.ReactNode, 
    label: string, 
    isActive: boolean, 
    onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-accent text-white shadow-lg'
        : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);


export default function Sidebar({ activeView, setActiveView, isSidebarOpen, setSidebarOpen, onOpenCategoryModal }: SidebarProps): React.ReactElement {
  
  const handleNavClick = (view: 'dashboard' | 'reports') => {
    setActiveView(view);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };
  
  const handleSettingsClick = () => {
    onOpenCategoryModal();
    setSidebarOpen(false);
  }

  const sidebarContent = (
      <div className="bg-primary h-full flex flex-col p-4">
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">ThuChiPro</h2>
            <p className="text-xs text-text-secondary">Quản lý tài chính</p>
        </div>
        <nav className="flex flex-col space-y-2">
            <NavLink 
                icon={<DashboardIcon />}
                label="Trang Chủ"
                isActive={activeView === 'dashboard'}
                onClick={() => handleNavClick('dashboard')}
            />
            <NavLink 
                icon={<ReportsIcon />}
                label="Báo Cáo"
                isActive={activeView === 'reports'}
                onClick={() => handleNavClick('reports')}
            />
             <NavLink 
                icon={<SettingsIcon />}
                label="Cài Đặt"
                isActive={false}
                onClick={handleSettingsClick}
            />
        </nav>
      </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'bg-black bg-opacity-60' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-64 shadow-2xl">
        {sidebarContent}
      </aside>
    </>
  );
}
