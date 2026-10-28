/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sacco, SavedPlace, RouteOption, RecentSearch, TransportPreferences } from '../../types/transit';
import { SACCOS, TRANSIT_STOPS, MOCK_ROUTES, matchStopByQuery } from '../../data/mockData';
import { 
  getSavedPlaces, 
  savePlace, 
  deletePlace, 
  getRecentSearches, 
  addRecentSearch, 
  deleteRecentSearch, 
  clearRecentSearches,
  getTransportPreferences,
  STORAGE_EVENT 
} from '../../utils/storage';
import { SavedPlaceModal, SavedPlaceActionModal } from '../modals/SavedPlaceModal';
import { 
  Search, 
  MapPin, 
  Clock, 
  Zap, 
  ChevronRight, 
  Home as HomeIcon, 
  Briefcase, 
  Plane, 
  ShoppingBag,
  Navigation, 
  ArrowUpRight,
  Plus,
  Trash2,
  X,
  History,
  Check,
  Heart
} from 'lucide-react';

interface HomeScreenProps {
  selectedSaccoId: string;
  onSelectSacco: (saccoId: string) => void;
  onNavigateToActivity: (destinationQuery?: string, selectedRouteId?: string, originQuery?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedSaccoId,
  onSelectSacco,
  onNavigateToActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [electricFilter, setElectricFilter] = useState(false);

  // Storage states
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => getSavedPlaces());
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => getRecentSearches());
  const [transportPrefs, setTransportPrefs] = useState<TransportPreferences>(() => getTransportPreferences());

  // Modal states
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [placeToEdit, setPlaceToEdit] = useState<SavedPlace | null>(null);
  const [actionModalPlace, setActionModalPlace] = useState<SavedPlace | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize state with storage changes (cross-component updates)
  const refreshFromStorage = useCallback(() => {
    setSavedPlaces(getSavedPlaces());
    setRecentSearches(getRecentSearches());
    setTransportPrefs(getTransportPreferences());
  }, []);

  useEffect(() => {
    window.addEventListener(STORAGE_EVENT, refreshFromStorage);
    return () => window.removeEventListener(STORAGE_EVENT, refreshFromStorage);
  }, [refreshFromStorage]);

  // Filtered and Prioritized SACCOs:
  // When prioritizePreferred is active, preferred operators are placed immediately after "All SACCOs"
  // without hiding any non-preferred operators.
  const displaySaccos = useMemo(() => {
    let list = [...SACCOS];
    if (electricFilter) {
      list = list.filter((s) => s.id === 'all' || s.isElectric);
    }
    if (transportPrefs.prioritizePreferred && transportPrefs.preferredSaccoIds.length > 0) {
      const allItem = list.find((s) => s.id === 'all');
      const preferredItems = list.filter(
        (s) => s.id !== 'all' && transportPrefs.preferredSaccoIds.includes(s.id)
      );
      const otherItems = list.filter(
        (s) => s.id !== 'all' && !transportPrefs.preferredSaccoIds.includes(s.id)
      );
      list = allItem ? [allItem, ...preferredItems, ...otherItems] : [...preferredItems, ...otherItems];
    }
    return list;
  }, [electricFilter, transportPrefs]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      onNavigateToActivity();
      return;
    }

    // Match query against known Nairobi transit stops to ensure accurate coordinates
    const matchedStop = matchStopByQuery(query);
    if (matchedStop) {
      addRecentSearch(matchedStop.name, matchedStop.lat, matchedStop.lng, matchedStop.id);
      onNavigateToActivity(matchedStop.name);
    } else {
      // Check if matches a saved place
      const matchedPlace = savedPlaces.find(
        (p) => p.title.toLowerCase().includes(query.toLowerCase())
      );
      if (matchedPlace) {
        addRecentSearch(matchedPlace.title, matchedPlace.lat, matchedPlace.lng, matchedPlace.stopId);
        onNavigateToActivity(matchedPlace.title);
      } else {
        // Fallback to query
        onNavigateToActivity(query);
      }
    }
  };

  // Handle Quick Location Pills
  const handleQuickDestination = (destName: string) => {
    const matchedStop = matchStopByQuery(destName);
    if (matchedStop) {
      addRecentSearch(matchedStop.name, matchedStop.lat, matchedStop.lng, matchedStop.id);
      onNavigateToActivity(matchedStop.name);
    } else {
      onNavigateToActivity(destName);
    }
  };

  // Handle Recent Search Click
  const handleRecentSearchClick = (recent: RecentSearch) => {
    addRecentSearch(recent.destination, recent.lat, recent.lng, recent.stopId, recent.saccoHint);
    onNavigateToActivity(recent.destination);
  };

  // Handle Route Card Click
  const handleRouteClick = (route: RouteOption) => {
    addRecentSearch(route.toStop.name, route.toStop.lat, route.toStop.lng, route.toStop.id, route.saccoId);
    onNavigateToActivity(route.toStop.name, route.id);
  };

  // Format relative timestamp
  const formatTimeAgo = (isoString: string): string => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  // Icon selector for saved places
  const getPlaceIcon = (iconName: SavedPlace['iconName']) => {
    switch (iconName) {
      case 'home':
        return HomeIcon;
      case 'briefcase':
        return Briefcase;
      case 'plane':
        return Plane;
      case 'shopping-bag':
        return ShoppingBag;
      default:
        return MapPin;
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b1b3d] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#00e575]" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            const isPreferred = sacco.id !== 'all' && transportPrefs.preferredSaccoIds.includes(sacco.id);
            return (
              <button
                key={sacco.id}
                onClick={() => onSelectSacco(sacco.id)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all text-xs font-semibold ${
                  isSelected
                    ? 'bg-[#0b1b3d] text-white border-[#0b1b3d] shadow-sm'
                    : isPreferred
                    ? 'bg-rose-50/50 text-slate-800 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isPreferred && (
                  <Heart className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#00e575] fill-[#00e575]' : 'text-rose-500 fill-rose-500'}`} />
                )}
                {sacco.isElectric ? (
                  <span className="w-2 h-2 rounded-full bg-[#00e575] shadow-[0_0_8px_#00e575]" />
                ) : !isPreferred ? (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                ) : null}
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
          {['Westlands', 'Kencom CBD', 'Karen', 'JKIA Airport', 'Upper Hill', 'Yaya Centre', 'Roysambu'].map((loc) => (
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

      {/* 3. Saved Place Shortcuts with Add/Edit/Select */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
              Saved Places
            </h2>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-full">
              {savedPlaces.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPlaceToEdit(null);
                setIsPlaceModalOpen(true);
              }}
              className="text-xs text-[#0b1b3d] font-bold hover:underline flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs hover:bg-slate-50 transition"
            >
              <Plus className="w-3 h-3 text-[#00e575]" />
              <span>Add Place</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {savedPlaces.map((place) => {
            const Icon = getPlaceIcon(place.iconName);

            return (
              <button
                key={place.id}
                onClick={() => setActionModalPlace(place)}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#e5e7eb] hover:border-[#0b1b3d] hover:shadow-xs transition text-left group relative"
              >
                <div className="p-2 rounded-xl bg-[#f6f8fa] group-hover:bg-[#0b1b3d] group-hover:text-white transition text-[#0b1b3d] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-[#111827] group-hover:text-[#0b1b3d] truncate">
                    {place.title}
                  </div>
                  <div className="text-[11px] text-[#6b7280] truncate mt-0.5">
                    {place.address || 'Nairobi'}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Add Shortcut Card */}
          <button
            onClick={() => {
              setPlaceToEdit(null);
              setIsPlaceModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-dashed border-2 border-dashed border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-800 transition text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Place</span>
          </button>
        </div>
      </section>

      {/* 4. Recent Destination Searches */}
      <section className="bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold font-heading text-[#111827]">
              Recent Destinations
            </h2>
            {recentSearches.length > 0 && (
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                ({recentSearches.length}/10)
              </span>
            )}
          </div>
          {recentSearches.length > 0 && (
            <button
              onClick={() => {
                clearRecentSearches();
                setRecentSearches([]);
                showToast('Recent searches cleared');
              }}
              className="text-xs text-slate-400 hover:text-red-600 font-semibold transition"
            >
              Clear all
            </button>
          )}
        </div>

        {recentSearches.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentSearches.slice(0, 5).map((recent) => (
              <div
                key={recent.id}
                className="py-2.5 flex items-center justify-between group hover:bg-slate-50 px-2 rounded-xl transition"
              >
                <button
                  onClick={() => handleRecentSearchClick(recent)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f6f8fa] flex items-center justify-center text-slate-500 group-hover:bg-[#0b1b3d] group-hover:text-white transition shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs md:text-sm text-slate-900 group-hover:text-[#0b1b3d] truncate">
                      {recent.destination}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{formatTimeAgo(recent.timestamp)}</span>
                      <span>•</span>
                      <span className="font-mono">[{recent.lat.toFixed(3)}, {recent.lng.toFixed(3)}]</span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRecentSearchClick(recent)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0b1b3d] hover:bg-slate-100 transition"
                    title="View Route"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = deleteRecentSearch(recent.id);
                      setRecentSearches(updated);
                      showToast('Destination removed from recents');
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                    title="Remove from recents"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-600">No recent destination searches yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Searched places and chosen routes will be saved here for instant access.
            </p>
          </div>
        )}

        {recentSearches.length > 5 && (
          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400">
              Showing top 5 of {recentSearches.length} recent searches
            </span>
          </div>
        )}
      </section>

      {/* 5. Electric Green Corridors Spotlight */}
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
            onClick={() => {
              addRecentSearch('Westlands (Sarit/The Mall)', -1.2655, 36.8048, 'stop-westlands', 'super-metro');
              onNavigateToActivity('Westlands', 'route-e105-westlands');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00e575] text-[#0b1b3d] font-bold hover:bg-[#05f782] active:scale-95 transition shadow-sm"
          >
            <span>View Route</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. Nearest Bus Stage: Live Departures Board */}
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
          {(transportPrefs.prioritizePreferred && transportPrefs.preferredSaccoIds.length > 0
            ? [
                ...MOCK_ROUTES.filter((r) => transportPrefs.preferredSaccoIds.includes(r.saccoId)),
                ...MOCK_ROUTES.filter((r) => !transportPrefs.preferredSaccoIds.includes(r.saccoId)),
              ]
            : MOCK_ROUTES
          ).slice(0, 4).map((route) => {
            const isPreferred = transportPrefs.preferredSaccoIds.includes(route.saccoId);
            return (
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
                    <div className="font-bold text-sm text-[#111827] flex items-center gap-1.5 flex-wrap">
                      <span>{route.toStop.name}</span>
                      {route.isElectric && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                          ⚡ e-Bus
                        </span>
                      )}
                      {isPreferred && (
                        <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                          Preferred
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
            );
          })}
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

      {/* Add / Edit Saved Place Modal */}
      <SavedPlaceModal
        isOpen={isPlaceModalOpen}
        initialPlace={placeToEdit}
        onClose={() => {
          setIsPlaceModalOpen(false);
          setPlaceToEdit(null);
        }}
        onSave={(place) => {
          const updated = savePlace(place);
          setSavedPlaces(updated);
          showToast(`Saved "${place.title}"`);
        }}
        onDelete={(id) => {
          const updated = deletePlace(id);
          setSavedPlaces(updated);
          showToast('Place removed');
        }}
      />

      {/* Action Sheet when a Saved Place card is tapped */}
      <SavedPlaceActionModal
        place={actionModalPlace}
        onClose={() => setActionModalPlace(null)}
        onSetAsDestination={(place) => {
          addRecentSearch(place.title, place.lat, place.lng, place.stopId);
          onNavigateToActivity(place.title);
        }}
        onSetAsOrigin={(place) => {
          onNavigateToActivity(undefined, undefined, place.title);
        }}
        onEdit={(place) => {
          setPlaceToEdit(place);
          setIsPlaceModalOpen(true);
        }}
        onDelete={(id) => {
          const updated = deletePlace(id);
          setSavedPlaces(updated);
          showToast('Place removed');
        }}
      />
    </div>
  );
};
