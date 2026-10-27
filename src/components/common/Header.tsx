/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenProfile?: () => void;
  activeSaccoCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile, activeSaccoCount = 7 }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f9f9ff]/90 backdrop-blur-md border-b border-[#e5e7eb]/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo: Lowercase m3 branding */}
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold tracking-tighter text-[#0b1b3d] font-heading lowercase">
              m3
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00e575] ml-0.5 mb-1 inline-block animate-pulse"></span>
          </div>
          <span className="text-[11px] font-semibold text-[#6b7280] tracking-wide uppercase px-2 py-0.5 bg-[#e9edff] rounded-full text-[#0b1b3d]">
            Nairobi Transit
          </span>
        </div>

        {/* Status / Electric Network indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-[#00e575] fill-[#00e575]" />
            <span className="font-semibold text-[11px]">e-Fleet Live</span>
          </div>

          <div
            onClick={onOpenProfile}
            role="button"
            tabIndex={0}
            className="w-8 h-8 rounded-full bg-[#0b1b3d] text-white flex items-center justify-center font-bold text-xs shadow-xs hover:bg-slate-800 transition cursor-pointer"
            title="Aj Muchiri (Account)"
          >
            AM
          </div>
        </div>
      </div>
    </header>
  );
};
