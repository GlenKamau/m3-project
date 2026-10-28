/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NairobiMap } from '../map/NairobiMap';
import { 
  Sacco, 
  Vehicle, 
  TransitStop, 
  RouteOption, 
  ActivitySubTab, 
  PastTrip 
} from '../../types/transit';
import { 
  SACCOS, 
  TRANSIT_STOPS, 
  MOCK_VEHICLES, 
  MOCK_ROUTES, 
  MOCK_PAST_TRIPS,
  matchStopByQuery
} from '../../data/mockData';
import { routingService } from '../../utils/routingService';
import { TicketModal } from '../modals/TicketModal';
import { 
  ArrowUpDown, 
  Search, 
  MapPin, 
  Bus, 
  Zap, 
  Clock, 
  ChevronRight, 
  RotateCcw, 
  Compass, 
  Share2, 
  CheckCircle, 
  AlertCircle,
  Users,
  BatteryCharging,
  ArrowRight,
  Info,
  X
} from 'lucide-react';

interface ActivityScreenProps {
  selectedSaccoId: string;
  onSelectSacco: (saccoId: string) => void;
  initialDestination?: string;
  initialRouteId?: string;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  selectedSaccoId,
  onSelectSacco,
  initialDestination = '',
  initialRouteId,
}) => {
  // Sub-tabs: 'nearby' | 'routes' | 'history'
  const [subTab, setSubTab] = useState<ActivitySubTab>(
    initialRouteId || initialDestination ? 'routes' : 'nearby'
  );

  // Origin & Destination input strings
  const [originText, setOriginText] = useState('Kencom Terminal (CBD)');
  const [destinationText, setDestinationText] = useState(
    initialDestination || 'Westlands (Sarit/The Mall)'
  );

  // Active search dropdown focus state
  const [focusedInput, setFocusedInput] = useState<'origin' | 'destination' | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setFocusedInput(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync destination if initialDestination prop changes
  React.useEffect(() => {
    if (initialDestination) {
      setDestinationText(initialDestination);
      setSelectedRouteId(null);
    }
  }, [initialDestination]);

  // Electric filter toggle
  const [isElectricOnly, setIsElectricOnly] = useState(false);

  // Selected route and vehicle state
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    initialRouteId || null
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Ticket modal state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Resolve matching stops strictly without hardcoded fallback
  const originStop = useMemo(() => {
    return matchStopByQuery(originText) || null;
  }, [originText]);

  const destinationStop = useMemo(() => {
    return matchStopByQuery(destinationText) || null;
  }, [destinationText]);

  // Filter transit suggestions based on the focused input text
  const currentSuggestions = useMemo(() => {
    const text = focusedInput === 'origin' ? originText : destinationText;
    if (!text || !text.trim()) {
      return TRANSIT_STOPS;
    }
    const q = text.toLowerCase().trim();
    return TRANSIT_STOPS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.lines.some((l) => l.toLowerCase().includes(q))
    );
  }, [focusedInput, originText, destinationText]);

  // Dynamically resolve suggested routes connecting originStop to destinationStop
  const filteredRoutes = useMemo(() => {
    if (!originStop || !destinationStop || originStop.id === destinationStop.id) {
      return [];
    }

    // Primary route connecting user's origin to destination via routingService
    const primaryRoute = routingService.getRouteSync(
      originStop,
      destinationStop,
      selectedSaccoId,
      isElectricOnly
    );

    if (!primaryRoute) {
      return [];
    }

    // Alternative routes matching SACCO or electric filter
    const alternativeRoutes = MOCK_ROUTES.filter((r) => {
      if (r.id === primaryRoute.id) return false;
      if (selectedSaccoId !== 'all' && r.saccoId !== selectedSaccoId) return false;
      if (isElectricOnly && !r.isElectric) return false;
      return true;
    }).slice(0, 3);

    return [primaryRoute, ...alternativeRoutes];
  }, [originStop, destinationStop, selectedSaccoId, isElectricOnly]);

  const activeRoute = useMemo(() => {
    if (selectedRouteId) {
      const found = filteredRoutes.find((r) => r.id === selectedRouteId);
      if (found) return found;
    }
    return filteredRoutes[0] || null;
  }, [filteredRoutes, selectedRouteId]);

  // Swap Origin and Destination cleanly
  const handleSwapLocations = () => {
    const tempOrigin = originText;
    const tempDest = destinationText;
    setOriginText(tempDest);
    setDestinationText(tempOrigin);
    setSelectedRouteId(null);
  };

  // Select a past trip to repeat
  const handleRepeatTrip = (trip: PastTrip) => {
    setOriginText(trip.origin);
    setDestinationText(trip.destination);
    onSelectSacco(trip.saccoId);
    setSubTab('routes');

    const matchedRoute = MOCK_ROUTES.find((r) => r.routeCode === trip.routeCode);
    if (matchedRoute) {
      setSelectedRouteId(matchedRoute.id);
    } else {
      setSelectedRouteId(null);
    }
  };

  const handleShareTrip = () => {
    setShowShareNotification(true);
    setTimeout(() => {
      setShowShareNotification(false);
    }, 3000);
  };

  return (
    <div className="pb-24 pt-2 px-3 md:px-6 max-w-4xl mx-auto space-y-4">
      {/* 1. Origin & Destination Inputs Header Card with Autocomplete */}
      <section 
        ref={searchContainerRef} 
        className="bg-white rounded-3xl p-4 md:p-5 shadow-xs border border-[#e5e7eb] relative z-30"
      >
        <div className="flex items-center gap-3">
          {/* Timeline dots line */}
          <div className="flex flex-col items-center justify-between py-1 self-stretch">
            <div className="w-3 h-3 rounded-full bg-[#0b1b3d] ring-4 ring-slate-100" />
            <div className="w-0.5 flex-1 bg-slate-200 my-1" />
            <div className="w-3 h-3 rounded-full bg-[#00e575] ring-4 ring-emerald-50" />
          </div>

          {/* Input textboxes */}
          <div className="flex-1 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={originText}
                onFocus={() => setFocusedInput('origin')}
                onChange={(e) => {
                  setOriginText(e.target.value);
                  setSelectedRouteId(null);
                }}
                placeholder="Pick-up station / stage (e.g. Kencom)"
                className="w-full bg-[#f6f8fa] text-xs md:text-sm font-semibold text-[#111827] rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-[#0b1b3d]"
              />
              {originStop && (
                <span className="absolute right-3 top-2.5 text-[10px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">
                  {originStop.area}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={destinationText}
                onFocus={() => setFocusedInput('destination')}
                onChange={(e) => {
                  setDestinationText(e.target.value);
                  setSelectedRouteId(null);
                }}
                placeholder="Where to? (e.g. Sarit, Yaya, Karen)"
                className="w-full bg-[#f6f8fa] text-xs md:text-sm font-semibold text-[#111827] rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-[#0b1b3d]"
              />
              {destinationStop && (
                <span className="absolute right-3 top-2.5 text-[10px] text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">
                  {destinationStop.area}
                </span>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapLocations}
            aria-label="Swap starting-point and destination"
            className="w-10 h-10 rounded-2xl bg-[#f6f8fa] hover:bg-slate-200 active:scale-95 text-[#0b1b3d] flex items-center justify-center transition border border-slate-200/60 shrink-0"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {focusedInput && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1">
            <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold px-3">
              <span>Select {focusedInput === 'origin' ? 'Origin Stage' : 'Destination'}</span>
              <button 
                onClick={() => setFocusedInput(null)} 
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {currentSuggestions.length > 0 ? (
              currentSuggestions.map((stop) => (
                <button
                  key={stop.id}
                  onClick={() => {
                    if (focusedInput === 'origin') {
                      setOriginText(stop.name);
                    } else {
                      setDestinationText(stop.name);
                    }
                    setSelectedRouteId(null);
                    setFocusedInput(null);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition flex items-center justify-between border-b border-slate-50 last:border-0"
                >
                  <div>
                    <div className="text-xs md:text-sm font-bold text-slate-900">{stop.name}</div>
                    <div className="text-[11px] text-slate-500">{stop.area} • {stop.lines.join(', ')}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    [{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}]
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching stages found. Try searching Kencom, Sarit, Yaya, or Karen.
              </div>
            )}
          </div>
        )}

        {/* Quick Stage Presets */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] text-slate-400 uppercase font-bold shrink-0">
            Stages:
          </span>
          {TRANSIT_STOPS.slice(0, 7).map((stop) => (
            <button
              key={stop.id}
              onClick={() => {
                setDestinationText(stop.name);
                setSelectedRouteId(null);
              }}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              {stop.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Unrecognized Location or Unavailable Route Alert Banner */}
      {(!originStop || !destinationStop || originStop.id === destinationStop.id) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">
              {!originStop
                ? `Unrecognized origin stage: "${originText}".`
                : !destinationStop
                ? `Unrecognized destination stage: "${destinationText}".`
                : 'Origin and Destination are the same stage.'}
            </span>
            <div className="mt-1 text-[11px] text-amber-800">
              Please select a verified Nairobi stage (such as Kencom, Sarit Centre, Yaya Centre, Karen, or JKIA) to display a road-following transit route.
            </div>
          </div>
        </div>
      )}

      {/* 2. SACCO Filter Pills */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
            Filter Fleet by SACCO
          </span>
          <button
            onClick={() => setIsElectricOnly(!isElectricOnly)}
            className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold transition ${
              isElectricOnly
                ? 'bg-[#00e575] text-[#0b1b3d]'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>e-Bus Only</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {SACCOS.map((sacco) => {
            const isSelected = selectedSaccoId === sacco.id;
            return (
              <button
                key={sacco.id}
                onClick={() => onSelectSacco(sacco.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#0b1b3d] text-white border-[#0b1b3d] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{sacco.name}</span>
                {sacco.isElectric && (
                  <span className="text-[10px] text-emerald-400">⚡</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Map (Centered on Nairobi) */}
      <section className="w-full relative">
        <NairobiMap
          vehicles={MOCK_VEHICLES}
          stops={TRANSIT_STOPS}
          selectedRoute={subTab === 'routes' ? activeRoute : null}
          selectedVehicle={selectedVehicle}
          originStop={originStop}
          destinationStop={destinationStop}
          onSelectVehicle={(v) => {
            setSelectedVehicle(v);
          }}
          filterSaccoId={selectedSaccoId}
          isElectricOnly={isElectricOnly}
        />
      </section>

      {/* Share / Toast notification */}
      {showShareNotification && (
        <div className="bg-[#0b1b3d] text-white text-xs px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#00e575]" />
            <span>Trip tracker link copied to clipboard (demo)</span>
          </div>
        </div>
      )}

      {/* 4. Three Sub-Views Tab Bar */}
      <section className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
        <button
          onClick={() => setSubTab('nearby')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'nearby'
              ? 'bg-white text-[#0b1b3d] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          <span>Nearby Buses</span>
        </button>
        <button
          onClick={() => setSubTab('routes')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'routes'
              ? 'bg-white text-[#0b1b3d] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Suggested Routes</span>
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'history'
              ? 'bg-white text-[#0b1b3d] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Past Trips</span>
        </button>
      </section>

      {/* 5. Sub-Views Content */}

      {/* SUB-VIEW 1: Nearby Buses */}
      {subTab === 'nearby' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">
              Live fleet tracking around Nairobi CBD corridor
            </span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              Demo GPS Data
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOCK_VEHICLES.filter((v) => {
              if (selectedSaccoId !== 'all' && v.saccoId !== selectedSaccoId) return false;
              if (isElectricOnly && !v.isElectric) return false;
              return true;
            }).map((bus) => {
              const isSelected = selectedVehicle?.id === bus.id;
              return (
                <div
                  key={bus.id}
                  onClick={() => setSelectedVehicle(bus)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#00e575] shadow-md ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          bus.isElectric
                            ? 'bg-[#0b1b3d] text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {bus.routeNumber}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#111827] flex items-center gap-1.5">
                          <span>{bus.plate}</span>
                          {bus.isElectric && (
                            <span className="text-[10px] font-bold text-[#006d43] bg-emerald-100 px-1.5 py-0.2 rounded-full">
                              ⚡ Electric
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{bus.saccoName}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {bus.demoEtaMinutes} min away
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {bus.seatsAvailable}
                        </span>{' '}
                        seats free
                      </span>
                      {bus.isElectric && bus.batteryPct && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{bus.batteryPct}%</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicle(bus);
                        // Find matching route by bus.routeId
                        const matchedRoute = MOCK_ROUTES.find((r) => r.id === bus.routeId) || MOCK_ROUTES.find((r) => r.routeCode === bus.routeNumber) || MOCK_ROUTES[0];
                        setSelectedRouteId(matchedRoute.id);
                        setIsTicketModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#0b1b3d] text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Board Bus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SUB-VIEW 2: Suggested Routes */}
      {subTab === 'routes' && (
        <section className="space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#111827] text-base">Route Unavailable</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  No road-following transit corridor available between &quot;{originText}&quot; and &quot;{destinationText}&quot;. Please choose from verified Nairobi transit stages below:
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {TRANSIT_STOPS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setDestinationText(st.name);
                      setSelectedRouteId(null);
                    }}
                    className="px-3 py-1.5 text-xs rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
            {filteredRoutes.map((route) => {
              const isSelected = activeRoute?.id === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    setOriginText(route.fromStop.name);
                    setDestinationText(route.toStop.name);
                  }}
                  className={`bg-white rounded-3xl p-4 md:p-5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0b1b3d] shadow-md ring-2 ring-slate-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-[#0b1b3d] text-white">
                          {route.routeCode}
                        </span>
                        {route.tag && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              route.tag === 'Pure Electric'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {route.tag}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">
                          {route.saccoName}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#111827]">
                        {route.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-[#0b1b3d]">
                        KES {route.demoFareKes}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        demo fare
                      </div>
                    </div>
                  </div>

                  {/* Route Steps summary */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-2xl">
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{route.durationMinutes} mins total</span>
                      <span>•</span>
                      <span>{route.walkMinutes} min walk</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">
                        {route.nextDepartures[0]}
                      </span>
                    </div>

                    {route.isElectric && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#00e575]" />
                        <span>-{route.co2SavedKg}kg CO₂</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Detailed Selected Route Sheet */}
          {activeRoute && (
            <div className="bg-[#f9f9ff] rounded-3xl p-5 border border-[#e5e7eb] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#6b7280]">
                    Journey Details
                  </span>
                  <h4 className="text-lg font-bold text-[#0b1b3d]">
                    {activeRoute.name} ({activeRoute.routeCode})
                  </h4>
                </div>

                <button
                  onClick={handleShareTrip}
                  className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  title="Share Trip Status"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Step-by-Step Stop Itinerary */}
              <div className="space-y-3 pl-2">
                {activeRoute.stops.map((stop, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === activeRoute.stops.length - 1;
                  return (
                    <div key={stop.id} className="flex items-start gap-3 relative">
                      {/* Vertical line connecting stops */}
                      {!isLast && (
                        <div className="absolute left-[7px] top-4 bottom-[-16px] w-0.5 bg-slate-300" />
                      )}
                      <div
                        className={`w-4 h-4 rounded-full mt-0.5 z-10 shrink-0 ${
                          isFirst
                            ? 'bg-[#0b1b3d] ring-2 ring-slate-200'
                            : isLast
                            ? 'bg-[#00e575] ring-2 ring-emerald-100'
                            : 'bg-white border-2 border-slate-400'
                        }`}
                      />
                      <div className="flex-1 pb-1">
                        <div className="text-xs font-bold text-slate-800">
                          {stop.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isFirst ? 'Boarding Stage' : isLast ? 'Arrival Stage' : 'Intermediate Stop'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Demo Disclaimer notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Demo Transit Data:</strong> Vehicle locations, arrival intervals, and fares are simulated for prototype demonstration.
                </div>
              </div>

              {/* Confirm / Board Button */}
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-full bg-[#0b1b3d] text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Select & Confirm Ride (KES {activeRoute.demoFareKes})</span>
                <ArrowRight className="w-4 h-4 text-[#00e575]" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* SUB-VIEW 3: Past Trips */}
      {subTab === 'history' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">
              Your recent Nairobi journeys
            </span>
            <span className="text-xs font-bold text-emerald-700">
              4 trips recorded
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_PAST_TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 transition shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {trip.routeCode}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {trip.saccoName}
                      </span>
                      {trip.isElectric && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                          ⚡ e-Ride
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {trip.date} • {trip.time}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#0b1b3d]">
                      KES {trip.fareKes}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {trip.mpesaRef}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Route: </span>
                    <span className="font-medium">{trip.origin}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="font-medium">{trip.destination}</span>
                  </div>

                  <button
                    onClick={() => handleRepeatTrip(trip)}
                    className="px-3 py-1 rounded-full bg-[#0b1b3d] text-white font-bold text-[11px] hover:bg-slate-800 transition"
                  >
                    Repeat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ticket Modal */}
      {isTicketModalOpen && activeRoute && (
        <TicketModal
          route={activeRoute}
          vehicle={selectedVehicle}
          onClose={() => setIsTicketModalOpen(false)}
          onTripStarted={() => setIsTicketModalOpen(false)}
        />
      )}
    </div>
  );
};
