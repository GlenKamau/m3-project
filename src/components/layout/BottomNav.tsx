/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TabType } from '../../types/transit';
import { Home, Compass, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'activity', label: 'Activity', icon: Compass },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e5e7eb] px-4 py-2 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#0b1b3d] font-bold'
                  : 'text-[#6b7280] hover:text-[#111827] font-medium'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-[#e8f4ee] text-[#0b1b3d]' : 'text-[#6b7280]'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform" />
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold text-[#0b1b3d]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
