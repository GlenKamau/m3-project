/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RouteOption, Vehicle } from '../../types/transit';
import { formatRouteFare, formatRouteDuration } from '../../utils/journeyHelper';
import { X, QrCode, CheckCircle2, ShieldCheck, Zap, ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';

interface TicketModalProps {
  route: RouteOption;
  vehicle?: Vehicle | null;
  onClose: () => void;
  onTripStarted?: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  route,
  vehicle,
  onClose,
  onTripStarted,
}) => {
  const [boarded, setBoarded] = useState(false);
  const mpesaRef = 'MP' + Math.floor(100000000 + Math.random() * 900000000);
  const seatNo = Math.floor(1 + Math.random() * 28);

  const handleBoard = () => {
    setBoarded(true);
    if (onTripStarted) {
      setTimeout(() => {
        onTripStarted();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0b1b3d] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-[#00e575] bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Demo Boarding Pass
            </span>
            {route.isElectric && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                <Zap className="w-3 h-3 text-[#00e575]" /> Zero Emission
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold font-heading">{route.name}</h2>
          <div className="text-xs text-slate-300 mt-0.5">Operated by {route.saccoName}</div>
        </div>

        {/* Journey Segment */}
        <div className="p-5 flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
              <div className="text-slate-400 font-medium">From</div>
              <div className="font-bold text-slate-800 text-sm">{route.fromStop.name}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="text-right">
              <div className="text-slate-400 font-medium">To</div>
              <div className="font-bold text-slate-800 text-sm">{route.toStop.name}</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#f9f9ff] p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Demo Fare</span>
              <span className="text-sm font-extrabold text-[#0b1b3d]">{formatRouteFare(route.demoFareKes)}</span>
            </div>
            <div className="bg-[#f9f9ff] p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Seat (Sim.)</span>
              <span className="text-sm font-extrabold text-[#0b1b3d]">#{seatNo}</span>
            </div>
            <div className="bg-[#f9f9ff] p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">ETA</span>
              <span className="text-sm font-extrabold text-emerald-600">{formatRouteDuration(route.durationMinutes)}</span>
            </div>
          </div>

          {/* QR Code and NFC simulation */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
              {/* Simulated QR Code graphic */}
              <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-[#00e575] relative overflow-hidden">
                <QrCode className="w-20 h-20 text-white" />
                <span className="text-[8px] font-mono tracking-widest text-[#00e575] mt-1 font-bold">
                  {mpesaRef}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-600 mt-2">
              Scan at electric bus validator or show conductor
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              Ref: {mpesaRef} • M-PESA Demo
            </span>
          </div>

          {/* Environmental badge */}
          {route.isElectric && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs">
              <Sparkles className="w-4 h-4 text-[#00e575] shrink-0" />
              <span>You save <strong>{route.co2SavedKg} kg CO₂</strong> on this zero-emission ride!</span>
            </div>
          )}

          {/* Simulation disclaimer note */}
          <div className="text-[10px] text-slate-400 text-center">
            * Prototype Demo: No real funds charged. Simulated Nairobi public transit pass.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          {boarded ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Ticket Validated! Boarding...</span>
            </div>
          ) : (
            <button
              onClick={handleBoard}
              className="w-full py-3.5 px-4 rounded-full bg-[#0b1b3d] text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Simulate Bus Boarding</span>
              <ArrowRight className="w-4 h-4 text-[#00e575]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
