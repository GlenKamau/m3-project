/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NairobiMap } from '../map/NairobiMap';
import {
  Vehicle,
  TransitStop,
  RouteOption,
  ActivitySubTab,
  PastTrip,
  TripStatus,
  RouteSortMode,
  SavedPlace,
  TransportPreferences,
} from '../../types/transit';
import {
  SACCOS,
  TRANSIT_STOPS,
  MOCK_VEHICLES,
  MOCK_ROUTES,
  matchStopByQuery,
} from '../../data/mockData';
import { routingService } from '../../utils/routingService';
import {
  isValidRouteGeometry,
  buildJourneyDirections,
  sortRouteOptions,
  formatRouteDuration,
  formatRouteFare,
} from '../../utils/journeyHelper';
import {
  getSavedPlaces,
  addRecentSearch,
  getTransportPreferences,
  getTripHistory,
  recordTrip,
  updateTripStatus,
  deleteTripRecord,
  STORAGE_EVENT,
} from '../../utils/storage';
import { TicketModal } from '../modals/TicketModal';
import { CommuterGuideModal } from '../modals/CommuterGuideModal';
import {
  ArrowUpDown,
  MapPin,
  Bus,
  Zap,
  Clock,
  RotateCcw,
  Compass,
  Share2,
  CheckCircle,
  AlertCircle,
  Users,
  BatteryCharging,
  ArrowRight,
  Info,
  X,
  Home as HomeIcon,
  Briefcase,
  Plane,
  ShoppingBag,
  Heart,
  BookOpen,
  Play,
  Bookmark,
  XCircle,
  Trash2,
  GitBranch,
  Edit3,
} from 'lucide-react';

interface ActivityScreenProps {
  selectedSaccoId: string;
  onSelectSacco: (saccoId: string) => void;
  initialOrigin?: string;
  initialDestination?: string;
  initialRouteId?: string;
  onUpdateJourneyState?: (
    originQuery: string,
    destinationQuery: string,
    selectedRouteId?: string | null
  ) => void;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  selectedSaccoId,
  onSelectSacco,
  initialOrigin = 'Kencom Terminal (CBD)',
  initialDestination = '',
  initialRouteId,
  onUpdateJourneyState,
}) => {
  // Sub-tabs: 'nearby' | 'routes' | 'history'
  const [subTab, setSubTab] = useState<ActivitySubTab>(
    initialRouteId || initialDestination ? 'routes' : 'nearby'
  );

  // Origin & Destination input strings
  const [originText, setOriginText] = useState(initialOrigin || 'Kencom Terminal (CBD)');
  const [destinationText, setDestinationText] = useState(
    initialDestination || 'Westlands (Sarit/The Mall)'
  );

  // Optional locked stop IDs when repeating a trip so coordinates never drift
  const [lockedOriginStopId, setLockedOriginStopId] = useState<string | null>(null);
  const [lockedDestStopId, setLockedDestStopId] = useState<string | null>(null);

  // Route sort mode
  const [routeSortMode, setRouteSortMode] = useState<RouteSortMode>('recommended');

  // Trip history status filter
  const [historyFilter, setHistoryFilter] = useState<'All' | TripStatus>('All');

  // Repeat journey notice when a previous route no longer exists or is refreshed
  const [repeatRouteNotice, setRepeatRouteNotice] = useState<{
    type: 'info' | 'warning';
    message: string;
  } | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Commuter Guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideSectionId, setGuideSectionId] = useState<string | null>(null);

  // Storage states synchronized across components
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => getSavedPlaces());
  const [transportPrefs, setTransportPrefs] = useState<TransportPreferences>(() =>
    getTransportPreferences()
  );
  const [tripHistory, setTripHistory] = useState<PastTrip[]>(() => getTripHistory());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    const handleStorageUpdate = () => {
      setSavedPlaces(getSavedPlaces());
      setTransportPrefs(getTransportPreferences());
      setTripHistory(getTripHistory());
    };
    window.addEventListener(STORAGE_EVENT, handleStorageUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleStorageUpdate);
  }, []);

  // Sync origin and destination if initial props change
  useEffect(() => {
    if (initialOrigin && initialOrigin !== originText) {
      setOriginText(initialOrigin);
      setLockedOriginStopId(null);
    }
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDestination && initialDestination !== destinationText) {
      setDestinationText(initialDestination);
      setLockedDestStopId(null);
    }
  }, [initialDestination]);

  // Active search dropdown focus state
  const [focusedInput, setFocusedInput] = useState<'origin' | 'destination' | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setFocusedInput(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Electric filter toggle
  const [isElectricOnly, setIsElectricOnly] = useState(false);

  // Selected route and vehicle state
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    initialRouteId || null
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Notify parent App of journey state changes so tab switching preserves selections
  useEffect(() => {
    if (onUpdateJourneyState) {
      onUpdateJourneyState(originText, destinationText, selectedRouteId);
    }
  }, [originText, destinationText, selectedRouteId]);

  // Ticket modal state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Resolve matching stops strictly without hardcoded fallback
  const originStop = useMemo(() => {
    if (lockedOriginStopId) {
      const byId = TRANSIT_STOPS.find((s) => s.id === lockedOriginStopId);
      if (byId) return byId;
    }
    return matchStopByQuery(originText) || null;
  }, [originText, lockedOriginStopId]);

  const destinationStop = useMemo(() => {
    if (lockedDestStopId) {
      const byId = TRANSIT_STOPS.find((s) => s.id === lockedDestStopId);
      if (byId) return byId;
    }
    return matchStopByQuery(destinationText) || null;
  }, [destinationText, lockedDestStopId]);

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

  // Filter saved places matching search input
  const matchingSavedPlaces = useMemo(() => {
    const text = focusedInput === 'origin' ? originText : destinationText;
    if (!text || !text.trim()) {
      return savedPlaces;
    }
    const q = text.toLowerCase().trim();
    return savedPlaces.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q))
    );
  }, [focusedInput, originText, destinationText, savedPlaces]);

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

    const combined = [primaryRoute, ...alternativeRoutes];
    return sortRouteOptions(
      combined,
      routeSortMode,
      transportPrefs.preferredSaccoIds,
      transportPrefs.prioritizePreferred && selectedSaccoId === 'all'
    );
  }, [
    originStop,
    destinationStop,
    selectedSaccoId,
    isElectricOnly,
    transportPrefs,
    routeSortMode,
  ]);

  // Operator filter pills: preserves 'all' ("All SACCOs") as first option.
  const displaySaccos = useMemo(() => {
    const list = [...SACCOS];
    if (
      transportPrefs.prioritizePreferred &&
      transportPrefs.preferredSaccoIds.length > 0
    ) {
      const allItem = list.find((s) => s.id === 'all');
      const preferredItems = list.filter(
        (s) => s.id !== 'all' && transportPrefs.preferredSaccoIds.includes(s.id)
      );
      const otherItems = list.filter(
        (s) => s.id !== 'all' && !transportPrefs.preferredSaccoIds.includes(s.id)
      );
      return allItem
        ? [allItem, ...preferredItems, ...otherItems]
        : [...preferredItems, ...otherItems];
    }
    return list;
  }, [transportPrefs]);

  const activeRoute = useMemo(() => {
    if (selectedRouteId) {
      const found = filteredRoutes.find((r) => r.id === selectedRouteId);
      if (found) return found;
    }
    return filteredRoutes[0] || null;
  }, [filteredRoutes, selectedRouteId]);

  const activeRouteGeometryValid = useMemo(
    () => isValidRouteGeometry(activeRoute),
    [activeRoute]
  );

  // Build step-by-step directions for the active route
  const journeySteps = useMemo(() => {
    if (!activeRoute) return [];
    return buildJourneyDirections(activeRoute, originText, destinationText);
  }, [activeRoute, originText, destinationText]);

  // Find if there is an active (Planned or In progress) prototype trip matching the current route
  const activePrototypeTrip = useMemo(() => {
    if (!activeRoute) return null;
    return (
      tripHistory.find(
        (t) =>
          (t.status === 'Planned' || t.status === 'In progress') &&
          (t.routeId === activeRoute.id || t.routeCode === activeRoute.routeCode)
      ) || null
    );
  }, [tripHistory, activeRoute]);

  // Filtered trip history for the Past Trips view
  const displayedTrips = useMemo(() => {
    if (historyFilter === 'All') return tripHistory;
    return tripHistory.filter((t) => t.status === historyFilter);
  }, [tripHistory, historyFilter]);

  // Swap Origin and Destination cleanly
  const handleSwapLocations = () => {
    const tempOrigin = originText;
    const tempDest = destinationText;
    const tempOriginStopId = lockedOriginStopId;
    const tempDestStopId = lockedDestStopId;
    setOriginText(tempDest);
    setDestinationText(tempOrigin);
    setLockedOriginStopId(tempDestStopId);
    setLockedDestStopId(tempOriginStopId);
    setSelectedRouteId(null);
    setRepeatRouteNotice(null);
  };

  // Record a Planned or In-Progress prototype journey
  const handleCreatePrototypeTrip = (status: 'Planned' | 'In progress') => {
    if (!activeRoute) return;

    const fromSt = originStop || activeRoute.fromStop;
    const toSt = destinationStop || activeRoute.toStop;

    const updated = recordTrip({
      origin: originText.trim() || fromSt.name,
      originLat: fromSt.lat,
      originLng: fromSt.lng,
      originStopId: fromSt.id,
      destination: destinationText.trim() || toSt.name,
      destinationLat: toSt.lat,
      destinationLng: toSt.lng,
      destinationStopId: toSt.id,
      routeId: activeRoute.id,
      routeCode: activeRoute.routeCode,
      routeName: activeRoute.name,
      saccoId: activeRoute.saccoId,
      saccoName: activeRoute.saccoName,
      fareKes: activeRoute.demoFareKes,
      durationMinutes: activeRoute.durationMinutes,
      isElectric: activeRoute.isElectric,
      status,
    });

    setTripHistory(updated);
    showToast(
      status === 'Planned'
        ? `Saved "${activeRoute.routeCode}" as Planned Trip (Demo)`
        : `Started Demo Journey on ${activeRoute.routeCode} (In progress)`
    );
  };

  // Transition status of an existing trip
  const handleTransitionTripStatus = (tripId: string, newStatus: TripStatus) => {
    const updated = updateTripStatus(tripId, newStatus);
    setTripHistory(updated);
    showToast(`Prototype trip marked as "${newStatus}"`);
  };

  // Select a past trip to repeat
  const handleRepeatTrip = (trip: PastTrip) => {
    // 1. Restore stored origin and destination names and lock their stop IDs / coordinates
    setOriginText(trip.origin);
    setDestinationText(trip.destination);

    const resolvedOriginStop =
      (trip.originStopId && TRANSIT_STOPS.find((s) => s.id === trip.originStopId)) ||
      matchStopByQuery(trip.origin) ||
      TRANSIT_STOPS.find(
        (s) =>
          Math.abs(s.lat - trip.originLat) < 0.002 &&
          Math.abs(s.lng - trip.originLng) < 0.002
      ) ||
      null;

    const resolvedDestStop =
      (trip.destinationStopId &&
        TRANSIT_STOPS.find((s) => s.id === trip.destinationStopId)) ||
      matchStopByQuery(trip.destination) ||
      TRANSIT_STOPS.find(
        (s) =>
          Math.abs(s.lat - trip.destinationLat) < 0.002 &&
          Math.abs(s.lng - trip.destinationLng) < 0.002
      ) ||
      null;

    setLockedOriginStopId(resolvedOriginStop?.id || null);
    setLockedDestStopId(resolvedDestStop?.id || null);

    // Clear stale selected vehicle so outdated bus positions or arrival estimates are not reused
    setSelectedVehicle(null);

    // Reset SACCO filter to 'all' if the previous SACCO no longer exists
    const saccoExists = SACCOS.some((s) => s.id === trip.saccoId);
    onSelectSacco(saccoExists ? trip.saccoId : 'all');

    // Switch to Suggested Routes sub-tab
    setSubTab('routes');

    // Check if the previous route still exists in the current dataset
    const existingMockRoute = MOCK_ROUTES.find(
      (r) => r.id === trip.routeId || r.routeCode === trip.routeCode
    );
    const dynamicRecalculatedRoute =
      resolvedOriginStop && resolvedDestStop
        ? routingService.getRouteSync(
            resolvedOriginStop,
            resolvedDestStop,
            saccoExists ? trip.saccoId : 'all',
            false
          )
        : null;

    if (existingMockRoute) {
      setSelectedRouteId(existingMockRoute.id);
      setRepeatRouteNotice({
        type: 'info',
        message: `Repeating journey ${trip.origin} → ${trip.destination}. Retrieved fresh route options and current simulated departures.`,
      });
    } else if (
      dynamicRecalculatedRoute &&
      dynamicRecalculatedRoute.id === trip.routeId
    ) {
      setSelectedRouteId(dynamicRecalculatedRoute.id);
      setRepeatRouteNotice({
        type: 'info',
        message: `Repeating journey ${trip.origin} → ${trip.destination}. Recalculated current corridor route.`,
      });
    } else {
      setSelectedRouteId(dynamicRecalculatedRoute?.id || null);
      setRepeatRouteNotice({
        type: 'warning',
        message: `Previous route "${trip.routeCode}" (${trip.routeId}) is no longer in the current dataset. Showing current available route options for ${trip.origin} → ${trip.destination}.`,
      });
    }
  };

  const handleOpenGuideSection = (sectionId: string) => {
    setGuideSectionId(sectionId);
    setIsGuideOpen(true);
  };

  const handleShareTrip = () => {
    setShowShareNotification(true);
    setTimeout(() => {
      setShowShareNotification(false);
    }, 3000);
  };

  const getStatusBadgeStyle = (status: TripStatus) => {
    switch (status) {
      case 'Planned':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'In progress':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 md:px-6 max-w-4xl mx-auto space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b1b3d] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-[#00e575]" />
          <span>{toastMessage}</span>
        </div>
      )}

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
                ref={originInputRef}
                type="text"
                value={originText}
                onFocus={() => setFocusedInput('origin')}
                onChange={(e) => {
                  setOriginText(e.target.value);
                  setLockedOriginStopId(null);
                  setSelectedRouteId(null);
                  setRepeatRouteNotice(null);
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
                  setLockedDestStopId(null);
                  setSelectedRouteId(null);
                  setRepeatRouteNotice(null);
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
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1">
            <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold px-3">
              <span>
                Select {focusedInput === 'origin' ? 'Origin Stage' : 'Destination'}
              </span>
              <button
                onClick={() => setFocusedInput(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Saved Places matching search */}
            {matchingSavedPlaces.length > 0 && (
              <div className="bg-slate-50/80 p-1 border-b border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1 block">
                  Saved Places
                </span>
                {matchingSavedPlaces.map((place) => {
                  const Icon =
                    place.iconName === 'home'
                      ? HomeIcon
                      : place.iconName === 'briefcase'
                      ? Briefcase
                      : place.iconName === 'plane'
                      ? Plane
                      : place.iconName === 'shopping-bag'
                      ? ShoppingBag
                      : MapPin;

                  return (
                    <button
                      key={`sp-${place.id}`}
                      onClick={() => {
                        if (focusedInput === 'origin') {
                          setOriginText(place.title);
                          setLockedOriginStopId(place.stopId || null);
                        } else {
                          setDestinationText(place.title);
                          setLockedDestStopId(place.stopId || null);
                          addRecentSearch(
                            place.title,
                            place.lat,
                            place.lng,
                            place.stopId
                          );
                        }
                        setSelectedRouteId(null);
                        setRepeatRouteNotice(null);
                        setFocusedInput(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white rounded-xl transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-[#0b1b3d] group-hover:border-[#00e575]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-[#0b1b3d]">
                            {place.title}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {place.address || 'Saved shortcut'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        Saved
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Transit Stop Suggestions */}
            {currentSuggestions.length > 0 ? (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 px-3.5 pt-2 pb-1 block">
                  Nairobi Transit Stages
                </span>
                {currentSuggestions.map((stop) => (
                  <button
                    key={stop.id}
                    onClick={() => {
                      if (focusedInput === 'origin') {
                        setOriginText(stop.name);
                        setLockedOriginStopId(stop.id);
                      } else {
                        setDestinationText(stop.name);
                        setLockedDestStopId(stop.id);
                        addRecentSearch(stop.name, stop.lat, stop.lng, stop.id);
                      }
                      setSelectedRouteId(null);
                      setRepeatRouteNotice(null);
                      setFocusedInput(null);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition flex items-center justify-between border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <div className="text-xs md:text-sm font-bold text-slate-900">
                        {stop.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {stop.area} • {stop.lines.join(', ')}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      [{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}]
                    </div>
                  </button>
                ))}
              </div>
            ) : matchingSavedPlaces.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching stages found. Try searching Kencom, Sarit, Yaya, or Karen.
              </div>
            ) : null}
          </div>
        )}

        {/* Quick Saved Places Shortcuts */}
        {savedPlaces.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">
              Saved:
            </span>
            {savedPlaces.map((place) => {
              const Icon =
                place.iconName === 'home'
                  ? HomeIcon
                  : place.iconName === 'briefcase'
                  ? Briefcase
                  : place.iconName === 'plane'
                  ? Plane
                  : place.iconName === 'shopping-bag'
                  ? ShoppingBag
                  : MapPin;

              return (
                <button
                  key={place.id}
                  onClick={() => {
                    if (focusedInput === 'origin') {
                      setOriginText(place.title);
                      setLockedOriginStopId(place.stopId || null);
                    } else {
                      setDestinationText(place.title);
                      setLockedDestStopId(place.stopId || null);
                      addRecentSearch(
                        place.title,
                        place.lat,
                        place.lng,
                        place.stopId
                      );
                    }
                    setSelectedRouteId(null);
                    setRepeatRouteNotice(null);
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 border border-slate-200/70 font-semibold transition text-[11px]"
                  title={`Set ${place.title} as ${
                    focusedInput === 'origin' ? 'Origin' : 'Destination'
                  }`}
                >
                  <Icon className="w-3 h-3 text-slate-500" />
                  <span>{place.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Stage Presets */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">
            Stages:
          </span>
          {TRANSIT_STOPS.slice(0, 7).map((stop) => (
            <button
              key={stop.id}
              onClick={() => {
                if (focusedInput === 'origin') {
                  setOriginText(stop.name);
                  setLockedOriginStopId(stop.id);
                } else {
                  setDestinationText(stop.name);
                  setLockedDestStopId(stop.id);
                  addRecentSearch(stop.name, stop.lat, stop.lng, stop.id);
                }
                setSelectedRouteId(null);
                setRepeatRouteNotice(null);
              }}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition text-[11px]"
            >
              {stop.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Repeat Journey Notice Banner */}
      {repeatRouteNotice && (
        <div
          className={`rounded-2xl p-3.5 flex items-start justify-between gap-2.5 text-xs border ${
            repeatRouteNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-2">
            <Info
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                repeatRouteNotice.type === 'warning'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            />
            <div>
              <span className="font-bold block">
                {repeatRouteNotice.type === 'warning'
                  ? 'Previous Route Unavailable in Current Timetable'
                  : 'Repeat Journey Loaded'}
              </span>
              <span className="text-[11px]">{repeatRouteNotice.message}</span>
            </div>
          </div>
          <button
            onClick={() => setRepeatRouteNotice(null)}
            className="text-slate-400 hover:text-slate-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenGuideSection('guide-saccos')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white text-[#0b1b3d] border border-slate-200 hover:bg-slate-50 font-semibold flex items-center gap-1 transition"
            >
              <BookOpen className="w-3 h-3 text-[#006d43]" />
              <span>Commuter Guide</span>
            </button>
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
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {displaySaccos.map((sacco) => {
            const isSelected = selectedSaccoId === sacco.id;
            const isPreferred =
              sacco.id !== 'all' &&
              transportPrefs.preferredSaccoIds.includes(sacco.id);
            return (
              <button
                key={sacco.id}
                onClick={() => onSelectSacco(sacco.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#0b1b3d] text-white border-[#0b1b3d] shadow-xs'
                    : isPreferred
                    ? 'bg-rose-50/60 text-slate-800 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isPreferred && (
                  <Heart
                    className={`w-3 h-3 shrink-0 ${
                      isSelected
                        ? 'text-[#00e575] fill-[#00e575]'
                        : 'text-rose-500 fill-rose-500'
                    }`}
                  />
                )}
                <span>{sacco.name}</span>
                {sacco.isElectric && (
                  <Zap className="w-3 h-3 text-emerald-500" aria-hidden="true" />
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
          <span>Past Trips ({tripHistory.length})</span>
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
              if (selectedSaccoId !== 'all' && v.saccoId !== selectedSaccoId)
                return false;
              if (isElectricOnly && !v.isElectric) return false;
              return true;
            })
              .sort((a, b) => {
                if (
                  transportPrefs.prioritizePreferred &&
                  selectedSaccoId === 'all'
                ) {
                  const aFav = transportPrefs.preferredSaccoIds.includes(
                    a.saccoId
                  )
                    ? 1
                    : 0;
                  const bFav = transportPrefs.preferredSaccoIds.includes(
                    b.saccoId
                  )
                    ? 1
                    : 0;
                  if (bFav !== aFav) return bFav - aFav;
                }
                return a.demoEtaMinutes - b.demoEtaMinutes;
              })
              .map((bus) => {
                const isSelected = selectedVehicle?.id === bus.id;
                const isPreferred = transportPrefs.preferredSaccoIds.includes(
                  bus.saccoId
                );
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
                          <div className="font-bold text-sm text-[#111827] flex items-center gap-1.5 flex-wrap">
                            <span>{bus.plate}</span>
                            {bus.isElectric && (
                              <span className="text-[10px] font-bold text-[#006d43] bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                <span className="inline-flex items-center gap-0.5">
                                  <Zap className="w-3 h-3" aria-hidden="true" />
                                  Electric
                                </span>
                              </span>
                            )}
                            {isPreferred && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                                Preferred
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {bus.saccoName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ~{bus.demoEtaMinutes} min (Sim.)
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
                          const matchedRoute =
                            MOCK_ROUTES.find((r) => r.id === bus.routeId) ||
                            MOCK_ROUTES.find(
                              (r) => r.routeCode === bus.routeNumber
                            ) ||
                            MOCK_ROUTES[0];
                          setSelectedRouteId(matchedRoute.id);
                          setIsTicketModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#0b1b3d] text-white text-xs font-bold hover:bg-slate-800 transition"
                      >
                        Board Bus (Demo)
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* SUB-VIEW 2: Suggested Routes & Step-by-Step Journey Directions */}
      {subTab === 'routes' && (
        <section className="space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#111827] text-base">
                  Route Unavailable
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  No road-following transit corridor available between &quot;
                  {originText}&quot; and &quot;{destinationText}&quot;. Straight-line
                  fallback is disabled. Please choose from verified Nairobi
                  transit stages below:
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {TRANSIT_STOPS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setDestinationText(st.name);
                      setLockedDestStopId(st.id);
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
              {/* Route Comparison Sort Controls */}
              <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
                <span className="text-xs font-bold text-slate-500">
                  Compare {filteredRoutes.length} Route Options:
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  {(
                    [
                      { id: 'recommended', label: 'Recommended' },
                      { id: 'fastest', label: 'Fastest' },
                      { id: 'cheapest', label: 'Lowest Fare' },
                      { id: 'transfers', label: 'Fewest Transfers' },
                    ] as { id: RouteSortMode; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRouteSortMode(opt.id)}
                      className={`px-2.5 py-1 rounded-full border transition ${
                        routeSortMode === opt.id
                          ? 'bg-[#0b1b3d] text-white border-[#0b1b3d]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Route Cards */}
              {filteredRoutes.map((route) => {
                const isSelected = activeRoute?.id === route.id;
                const transfers =
                  typeof route.transfersCount === 'number'
                    ? route.transfersCount
                    : route.transferInfo
                    ? 1
                    : 0;
                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      setOriginText(route.fromStop.name);
                      setDestinationText(route.toStop.name);
                      setLockedOriginStopId(route.fromStop.id);
                      setLockedDestStopId(route.toStop.id);
                    }}
                    className={`bg-white rounded-3xl p-4 md:p-5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0b1b3d] shadow-md ring-2 ring-slate-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                          {transportPrefs.preferredSaccoIds.includes(
                            route.saccoId
                          ) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                              Preferred
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
                          {formatRouteFare(route.demoFareKes)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          demo fare
                        </div>
                      </div>
                    </div>

                    {/* Route Steps summary */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-2xl flex-wrap gap-2">
                      <div className="flex items-center gap-2 font-medium flex-wrap">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatRouteDuration(route.durationMinutes)}</span>
                        <span>•</span>
                        <span>
                          {transfers === 0
                            ? 'Direct (0 transfers)'
                            : `${transfers} transfer`}
                        </span>
                        <span>•</span>
                        <span>{route.stops.length} stages</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          Departs {route.nextDepartures[0]} (Sim.)
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

          {/* FEATURE 1: STEP-BY-STEP JOURNEY DIRECTIONS & DETAILS */}
          {activeRoute && (
            <div className="bg-[#f9f9ff] rounded-3xl p-5 border border-[#e5e7eb] space-y-5 shadow-xs">
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                      Step-by-Step Journey Directions
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Simulated Timetable
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold text-[#0b1b3d] font-heading">
                    {activeRoute.name} ({activeRoute.routeCode})
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operated by <strong>{activeRoute.saccoName}</strong> (ID:{' '}
                    <code className="text-[11px] font-mono">
                      {activeRoute.saccoId}
                    </code>
                    )
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      originInputRef.current?.focus();
                      setFocusedInput('origin');
                    }}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition"
                    title="Edit Origin or Destination without losing route context"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0b1b3d]" />
                    <span>Edit Locations</span>
                  </button>
                  <button
                    onClick={handleShareTrip}
                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    title="Share Trip Status"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Missing Route Geometry Warning (if geometry is invalid) */}
              {!activeRouteGeometryValid && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Road-Following Geometry Unavailable
                    </span>
                    <span className="text-[11px]">
                      Validated road-following coordinates are unavailable for
                      this route. m3 does not draw straight-line fallbacks
                      between endpoints.
                    </span>
                  </div>
                </div>
              )}

              {/* Summary Overview Grid: Origin, Boarding, Alighting, Destination, Duration, Transfers, Fare */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Boarding Stage
                  </span>
                  <span className="text-xs font-bold text-[#0b1b3d] block mt-0.5 truncate">
                    {activeRoute.stops[0]?.name || activeRoute.fromStop.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {activeRoute.stops[0]?.area || activeRoute.fromStop.area}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Alighting Stage
                  </span>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5 truncate">
                    {activeRoute.stops[activeRoute.stops.length - 1]?.name ||
                      activeRoute.toStop.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {activeRoute.stops[activeRoute.stops.length - 1]?.area ||
                      activeRoute.toStop.area}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Est. Duration & Transfers
                  </span>
                  <span className="text-xs font-bold text-[#111827] block mt-0.5">
                    {formatRouteDuration(activeRoute.durationMinutes)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {(activeRoute.transfersCount ??
                      (activeRoute.transferInfo ? 1 : 0)) === 0
                      ? '0 Transfers (Direct)'
                      : `${
                          activeRoute.transfersCount ?? 1
                        } Transfer (${activeRoute.transferInfo?.transferStop.name.split(' ')[0]})`}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Estimated Demo Fare
                  </span>
                  <span className="text-xs font-extrabold text-[#0b1b3d] block mt-0.5">
                    {formatRouteFare(activeRoute.demoFareKes)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {activeRoute.stops.length} total stages
                  </span>
                </div>
              </div>

              {/* Visually Distinguished Stop Sequence (Boarding -> Intermediate -> Transfer -> Alighting) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b1b3d]">
                    Route Stage Sequence ({activeRoute.stops.length} Stops)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {Math.max(0, activeRoute.stops.length - 2)} intermediate
                  </span>
                </div>

                <div className="space-y-3 pl-1">
                  {activeRoute.stops.map((stop, idx) => {
                    const isBoarding = idx === 0;
                    const isAlighting = idx === activeRoute.stops.length - 1;
                    const isTransfer =
                      activeRoute.transferInfo &&
                      activeRoute.transferInfo.transferStop.id === stop.id;

                    return (
                      <div
                        key={`${stop.id}-${idx}`}
                        className="flex items-start gap-3 relative"
                      >
                        {!isAlighting && (
                          <div className="absolute left-[9px] top-5 bottom-[-16px] w-0.5 bg-slate-200" />
                        )}
                        <div
                          className={`w-5 h-5 rounded-full mt-0.5 z-10 shrink-0 flex items-center justify-center text-[10px] font-extrabold ${
                            isBoarding
                              ? 'bg-[#0b1b3d] text-white ring-4 ring-slate-100'
                              : isAlighting
                              ? 'bg-[#00e575] text-[#0b1b3d] ring-4 ring-emerald-50'
                              : isTransfer
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                              : 'bg-white border-2 border-slate-400 text-slate-600'
                          }`}
                        >
                          {isBoarding
                            ? 'B'
                            : isAlighting
                            ? 'A'
                            : isTransfer
                            ? 'T'
                            : idx}
                        </div>

                        <div className="flex-1 flex items-center justify-between gap-2 pb-1">
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{stop.name}</span>
                              {isBoarding && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0b1b3d] text-white">
                                  Boarding Stop
                                </span>
                              )}
                              {isTransfer && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                  <GitBranch className="w-2.5 h-2.5" />
                                  Transfer Stage
                                </span>
                              )}
                              {isAlighting && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00e575] text-[#0b1b3d]">
                                  Alighting Stop
                                </span>
                              )}
                              {!isBoarding && !isAlighting && !isTransfer && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  Intermediate #{idx}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {stop.area}
                              {isTransfer && activeRoute.transferInfo && (
                                <span className="block text-amber-800 font-semibold mt-0.5">
                                  Change here to {activeRoute.transferInfo.nextSaccoName}{' '}
                                  ({activeRoute.transferInfo.nextRouteCode})
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            [{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}]
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sequential Step-by-Step Commuter Instructions */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b1b3d]">
                    Step-by-Step Commuter Directions
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Newcomer Friendly
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {journeySteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="py-2.5 first:pt-1 last:pb-1 flex items-start gap-3"
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${
                          step.type === 'board'
                            ? 'bg-[#0b1b3d] text-white'
                            : step.type === 'alight'
                            ? 'bg-[#00e575] text-[#0b1b3d]'
                            : step.type === 'transfer'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-slate-900">
                          {step.title}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contextual Help Links to Nairobi Commuter Guide */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0b1b3d]">
                  <BookOpen className="w-4 h-4 text-[#006d43]" />
                  <span>New to Nairobi transit?</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => handleOpenGuideSection('guide-stages')}
                    className="px-2.5 py-1 rounded-full bg-[#f6f8fa] hover:bg-slate-200 text-slate-700 transition"
                  >
                    Finding Stages
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenGuideSection('guide-payments-fares')
                    }
                    className="px-2.5 py-1 rounded-full bg-[#f6f8fa] hover:bg-slate-200 text-slate-700 transition"
                  >
                    Fares & M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenGuideSection('guide-missed-stop-transfers')
                    }
                    className="px-2.5 py-1 rounded-full bg-[#f6f8fa] hover:bg-slate-200 text-slate-700 transition"
                  >
                    Transfers & Missed Stops
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGuideSection('guide-terminology')}
                    className="px-2.5 py-1 rounded-full bg-[#f6f8fa] hover:bg-slate-200 text-slate-700 transition"
                  >
                    Commuter Terms
                  </button>
                </div>
              </div>

              {/* Active Prototype Journey Status Control (if Planned or In progress) */}
              {activePrototypeTrip && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                          activePrototypeTrip.status
                        )}`}
                      >
                        {activePrototypeTrip.status} (Prototype)
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Active Demo Trip on {activePrototypeTrip.routeCode}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activePrototypeTrip.status === 'Planned' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleTransitionTripStatus(
                            activePrototypeTrip.id,
                            'In progress'
                          )
                        }
                        className="px-3 py-1.5 rounded-full bg-[#0b1b3d] text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 text-[#00e575]" />
                        <span>Start Demo Journey</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleTransitionTripStatus(
                          activePrototypeTrip.id,
                          'Completed'
                        )
                      }
                      className="px-3 py-1.5 rounded-full bg-[#00e575] text-[#0b1b3d] text-xs font-bold hover:bg-[#05f782] transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Completed (Demo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleTransitionTripStatus(
                          activePrototypeTrip.id,
                          'Cancelled'
                        )
                      }
                      className="px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Cancel Demo Trip</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Demo Disclaimer notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Prototype Simulation Notice:</strong> Vehicle
                  locations, arrival intervals, fares, and journey status actions
                  are simulated for prototype demonstration and do not represent
                  verified physical travel.
                </div>
              </div>

              {/* Action Buttons: Save Planned Trip / Start Demo Journey / Boarding Pass */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCreatePrototypeTrip('Planned')}
                  className="py-3 px-4 rounded-full bg-white border border-slate-300 text-[#0b1b3d] font-bold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#0b1b3d]" />
                  <span>Save as Planned (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreatePrototypeTrip('In progress')}
                  className="py-3 px-4 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Start Demo Journey</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(true)}
                  className="py-3 px-4 rounded-full bg-[#0b1b3d] text-white font-bold text-xs hover:bg-slate-800 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>
                    Demo Pass ({formatRouteFare(activeRoute.demoFareKes)})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00e575]" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* FEATURE 2: SUB-VIEW 3: Past Trips & Repeat Journeys */}
      {subTab === 'history' && (
        <section className="space-y-3">
          {/* Prototype disclaimer banner */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Prototype Trip Log:</strong> Trips recorded here are
              separate from recent destination searches. Starting, completing,
              or cancelling a trip are prototype actions and do not represent
              verified physical travel. (Max 50 recent trips stored).
            </div>
          </div>

          {/* Filter Pills by Status */}
          <div className="flex items-center justify-between gap-2 flex-wrap px-1">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['All', 'Planned', 'In progress', 'Completed', 'Cancelled'] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setHistoryFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                      historyFilter === st
                        ? 'bg-[#0b1b3d] text-white border-[#0b1b3d]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>

            <span className="text-xs font-bold text-emerald-700">
              {displayedTrips.length} of {tripHistory.length} trips
            </span>
          </div>

          {displayedTrips.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-2 text-xs text-slate-500">
              <RotateCcw className="w-6 h-6 mx-auto text-slate-300" />
              <p className="font-bold text-slate-800">
                No trips matching &quot;{historyFilter}&quot;
              </p>
              <p>
                Select a route in Suggested Routes to save a Planned trip or
                start a Demo Journey.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 transition shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {trip.routeCode}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {trip.saccoName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                            trip.status
                          )}`}
                        >
                          {trip.status}
                        </span>
                        {trip.isElectric && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                            <span className="inline-flex items-center gap-0.5">
                              <Zap className="w-3 h-3" aria-hidden="true" />
                              e-Ride
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {trip.date} • {trip.time} •{' '}
                        {formatRouteDuration(trip.durationMinutes)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#0b1b3d]">
                        {formatRouteFare(trip.fareKes)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {trip.mpesaRef || 'DEMO-PASS'}
                      </span>
                    </div>
                  </div>

                  {/* Origin -> Destination with coordinates */}
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div>
                        <span className="text-slate-400">Journey: </span>
                        <span className="font-bold text-slate-900">
                          {trip.origin}
                        </span>
                        <span className="text-slate-400 mx-1.5">→</span>
                        <span className="font-bold text-slate-900">
                          {trip.destination}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Origin [{trip.originLat.toFixed(4)},{' '}
                        {trip.originLng.toFixed(4)}] → Dest [
                        {trip.destinationLat.toFixed(4)},{' '}
                        {trip.destinationLng.toFixed(4)}]
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleRepeatTrip(trip)}
                        className="px-3 py-1.5 rounded-full bg-[#0b1b3d] text-white font-bold text-[11px] hover:bg-slate-800 transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3 text-[#00e575]" />
                        <span>Repeat Journey</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = deleteTripRecord(trip.id);
                          setTripHistory(updated);
                          showToast('Removed trip record');
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove trip from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Prototype Status Transition Actions for Planned or In-Progress Trips */}
                  {(trip.status === 'Planned' ||
                    trip.status === 'In progress') && (
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-400 font-medium">
                        Prototype Status Controls:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {trip.status === 'Planned' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTransitionTripStatus(trip.id, 'In progress')
                            }
                            className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition"
                          >
                            Start Demo Ride
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleTransitionTripStatus(trip.id, 'Completed')
                          }
                          className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold transition"
                        >
                          Mark Completed (Demo)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleTransitionTripStatus(trip.id, 'Cancelled')
                          }
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Ticket Modal */}
      {isTicketModalOpen && activeRoute && (
        <TicketModal
          route={activeRoute}
          vehicle={selectedVehicle}
          onClose={() => setIsTicketModalOpen(false)}
          onTripStarted={() => {
            handleCreatePrototypeTrip('In progress');
            setIsTicketModalOpen(false);
          }}
        />
      )}

      {/* Contextual Nairobi Commuter Guide Modal */}
      <CommuterGuideModal
        isOpen={isGuideOpen}
        initialSectionId={guideSectionId}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
