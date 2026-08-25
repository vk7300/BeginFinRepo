
import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, collapsed, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        active 
        ? 'bg-slate-800 text-white font-medium shadow-sm' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <span className={`${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
        {icon}
      </span>
      {!collapsed && <span className="text-sm truncate">{label}</span>}
      {!collapsed && active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
    </button>
  );
};
