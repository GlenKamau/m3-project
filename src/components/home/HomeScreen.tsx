/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sacco, SavedPlace, TransitStop, RouteOption } from '../../types/transit';
import { SACCOS, MOCK_SAVED_PLACES, TRANSIT_STOPS, MOCK_ROUTES } from '../../data/mockData';
import { 
  Search, 
  MapPin, 
  Clock, 
  Zap, 
  ChevronRight, 
  Home as HomeIcon, 
  Briefcase, 
  Plane, 
  Navigation, 
  Sparkles,
  ArrowUpRight,
  Bus,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface HomeScreenProps {
  selectedSaccoId: string;
  onSelectSacco: (saccoId: string) => void;
  onNavigateToActivity: (destinationQuery?: string, selectedRouteId?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedSaccoId,
  onSelectSacco,
  onNavigateToActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [electricFilter, setElectricFilter] = useState(false);

  // Filtered SACCOs
  const displaySaccos = electricFilter 
    ? SACCOS.filter(s => s.id === 'all' || s.isElectric)
    : SACCOS;

  const handlePlaceClick = (place: SavedPlace) => {
    onNavigateToActivity(place.title);
  };

  const handleQuickDestination = (destName: string) => {
    onNavigateToActivity(destName);
  };

  const handleRouteClick = (route: RouteOption) => {
    onNavigateToActivity(route.toStop.name, route.id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToActivity(searchQuery);
    } else {
      onNavigateToActivity();
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-xl mx-auto space-y-6">
      {/* 1. SACCO Selection at the top */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
              Partner SACCOs & Fleet
            </h2>
          </div>
          <button
            onClick={() => setElectricFilter(!electricFilter)}
            className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold transition ${
              electricFilter
                ? 'bg-[#00e575] text-[#0b1b3d] shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            <span>e-Buses Only</span>
          </button>
        </div>

        {/* Horizontal scrollable SACCO chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {displaySaccos.map((sacco) => {
            const isSelected = selectedSaccoId === sacco.id;
            return (
              <button
                key={sacco.id}
                onClick={() => onSelectSacco(sacco.id)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-semibold ${
                  isSelected
                    ? 'bg-[#0b1b3d] text-white border-[#0b1b3d] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {sacco.isElectric ? (
                  <span className="w-2 h-2 rounded-full bg-[#00e575] shadow-[0_0_8px_#00e575]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
                <span>{sacco.name}</span>
                {sacco.isElectric && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
                    ⚡
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Prominent "Where to?" Search Field */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-[#e5e7eb] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold font-heading text-[#0b1b3d]">
            Habari, commuter 👋
          </span>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Simulated live network
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center bg-[#f6f8fa] hover:bg-white focus-within:bg-white rounded-2xl border-2 border-transparent focus-within:border-[#0b1b3d] px-4 py-3.5 shadow-xs transition-all">
            <Search className="w-5 h-5 text-[#6b7280] shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Where to? (e.g. Westlands, Kencom, Karen)"
              className="w-full bg-transparent text-[#111827] placeholder-[#6b7280] font-medium text-base outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-bold ml-2"
              >
                Clear
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0 bg-white px-2.5 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Now</span>
              </div>
            )}
          </div>
        </form>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {['Westlands', 'Kencom CBD', 'Karen', 'JKIA Airport', 'Upper Hill', 'Roysambu'].map((loc) => (
            <button
              key={loc}
              onClick={() => handleQuickDestination(loc)}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f6f8fa] hover:bg-[#e9edff] text-slate-700 border border-slate-200/60 transition"
            >
              {loc}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Saved Place Shortcuts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
            Saved Places
          </h2>
          <span className="text-xs text-[#0b1b3d] font-semibold cursor-pointer hover:underline" onClick={() => onNavigateToActivity()}>
            Manage
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MOCK_SAVED_PLACES.slice(0, 4).map((place) => {
            const Icon =
              place.iconName === 'home'
                ? HomeIcon
                : place.iconName === 'briefcase'
                ? Briefcase
                : place.iconName === 'plane'
                ? Plane
                : MapPin;

            return (
              <button
                key={place.id}
                onClick={() => handlePlaceClick(place)}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#e5e7eb] hover:border-slate-300 hover:shadow-xs transition text-left group"
              >
                <div className="p-2 rounded-xl bg-[#f6f8fa] group-hover:bg-[#0b1b3d] group-hover:text-white transition text-[#0b1b3d]">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#111827] group-hover:text-[#0b1b3d] truncate">
                    {place.title}
                  </div>
                  <div className="text-[11px] text-[#6b7280] truncate mt-0.5">
                    {place.address}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Electric Green Corridors Spotlight */}
      <section className="bg-gradient-to-br from-[#0b1b3d] to-[#162752] text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e575]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00e575] text-[#0b1b3d] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-[#0b1b3d]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#00e575] uppercase tracking-wider block">
                Nairobi Electric Corridor
              </span>
              <h3 className="text-base font-extrabold font-heading">Waiyaki Way Green Line</h3>
            </div>
          </div>
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-200 font-mono font-medium">
            3 min headway
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Super Metro & BasiGo electric buses running uninterrupted between Kencom CBD and Westlands. Clean, air-conditioned, and quiet.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px]">Demo Fare</span>
              <span className="font-bold text-white text-sm">KES 70</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CO₂ Offset</span>
              <span className="font-bold text-[#00e575] text-sm">1.4 kg / ride</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToActivity('Westlands', 'route-e105-westlands')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00e575] text-[#0b1b3d] font-bold hover:bg-[#05f782] active:scale-95 transition shadow-sm"
          >
            <span>View Route</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. Nearest Bus Stage: Live Departures Board */}
      <section className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-sm font-bold font-heading text-[#111827]">
              Live Departures: Kencom CBD
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Simulated
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {MOCK_ROUTES.slice(0, 3).map((route) => (
            <div
              key={route.id}
              onClick={() => handleRouteClick(route)}
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    route.isElectric
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {route.routeCode}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
                    <span>{route.toStop.name}</span>
                    {route.isElectric && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                        ⚡ e-Bus
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    via {route.saccoName} • ~{route.durationMinutes}m
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-[#0b1b3d] tabular-nums">
                  {route.nextDepartures[0]}
                </div>
                <div className="text-[11px] text-slate-500">
                  KES {route.demoFareKes}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onNavigateToActivity()}
          className="w-full py-2.5 mt-2 rounded-xl text-center text-xs font-bold text-[#0b1b3d] bg-[#f6f8fa] hover:bg-slate-100 transition flex items-center justify-center gap-1"
        >
          <span>Explore all Nairobi routes in Activity</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Demo notice */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        m3 Nairobi Demo • Timings and vehicle beacons are simulated for prototype review.
      </div>
    </div>
  );
};
