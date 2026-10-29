/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Vehicle, TransitStop, RouteOption } from '../../types/transit';
import { 
  initializeVehicleSimulation, 
  stepVehicleSimulation, 
  AnimatedVehicleState 
} from '../../utils/vehicleSimulation';
import { isValidRouteGeometry } from '../../utils/journeyHelper';
import { MOCK_ROUTES } from '../../data/mockData';
import { 
  Navigation2, 
  Layers, 
  Zap, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Users, 
  BatteryCharging, 
  X, 
  Compass, 
  ArrowRight,
  Gauge
} from 'lucide-react';

interface NairobiMapProps {
  vehicles: Vehicle[];
  stops: TransitStop[];
  selectedRoute: RouteOption | null;
  selectedVehicle: Vehicle | null;
  originStop?: TransitStop | null;
  destinationStop?: TransitStop | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSelectStop?: (stop: TransitStop) => void;
  filterSaccoId?: string;
  isElectricOnly?: boolean;
}

const NAIROBI_CENTER: [number, number] = [-1.286389, 36.817223];

export const NairobiMap: React.FC<NairobiMapProps> = ({
  vehicles,
  stops,
  selectedRoute,
  selectedVehicle,
  originStop,
  destinationStop,
  onSelectVehicle,
  onSelectStop,
  filterSaccoId = 'all',
  isElectricOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);

  // Markers and overlays
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const stopMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const intermediateMarkersRef = useRef<L.Marker[]>([]);

  // Animation simulation state
  const simulationStatesRef = useRef<Map<string, AnimatedVehicleState>>(
    initializeVehicleSimulation(vehicles, MOCK_ROUTES)
  );
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // UI state
  const [showStops, setShowStops] = useState<boolean>(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeGeometryMissing, setRouteGeometryMissing] = useState<boolean>(false);
  const [tileProviderName, setTileProviderName] = useState<string>('MapTiler Streets');
  const [inspectedVehicle, setInspectedVehicle] = useState<Vehicle | null>(selectedVehicle);

  // Read MapTiler API Key strictly from environment variable
  const mapTilerKey = (import.meta.env.VITE_MAPTILER_API_KEY as string | undefined)?.trim();

  // Initialize simulation states when vehicles prop updates
  useEffect(() => {
    simulationStatesRef.current = initializeVehicleSimulation(vehicles, MOCK_ROUTES);
  }, [vehicles]);

  // Sync inspectedVehicle with selectedVehicle prop
  useEffect(() => {
    if (selectedVehicle) {
      setInspectedVehicle(selectedVehicle);
    }
  }, [selectedVehicle]);

  // Filter vehicles by SACCO & Electric
  const filteredVehicles = vehicles.filter((v) => {
    if (filterSaccoId !== 'all' && v.saccoId !== filterSaccoId) return false;
    if (isElectricOnly && !v.isElectric) return false;
    return true;
  });

  // 1. Initialize Leaflet Map with MapTiler API
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: NAIROBI_CENTER,
      zoom: 13,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: false,
    });

    let tileLayer: L.TileLayer;

    if (mapTilerKey && mapTilerKey.length > 5 && !mapTilerKey.includes('YOUR_MAPTILER')) {
      // MapTiler Streets v2 raster tiles
      const mapTilerUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapTilerKey}`;
      tileLayer = L.tileLayer(mapTilerUrl, {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        maxZoom: 20,
        tileSize: 256,
      });
      setTileProviderName('MapTiler Streets-v2');

      tileLayer.on('tileerror', () => {
        setMapError(
          'MapTiler tiles failed to load. Check that your MapTiler API key has allowed HTTP origins or valid quota.'
        );
      });
    } else {
      // API Key missing or not yet configured
      setMapError(
        'MapTiler API key missing: Set VITE_MAPTILER_API_KEY in .env to load MapTiler tiles. (Fallback tiles displayed)'
      );
      // Clean fallback so the user still has an interactive map rather than a broken blank or static screenshot
      tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      });
      setTileProviderName('Fallback Carto (MapTiler key required)');
    }

    tileLayer.addTo(map);
    activeTileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Handle initial layout sizing
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapTilerKey]);

  // 2. Initialize / Reconcile Vehicle Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = vehicleMarkersRef.current;
    const currentIds = new Set(filteredVehicles.map((v) => v.id));

    // Remove old markers
    for (const [id, marker] of currentMarkers.entries()) {
      if (!currentIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    // Create markers for filtered vehicles with valid road-following geometry
    filteredVehicles.forEach((vehicle) => {
      const simState = simulationStatesRef.current.get(vehicle.id);
      if (!simState || !simState.isGeometryAvailable || !simState.geometry) {
        return;
      }

      const isSelected = inspectedVehicle?.id === vehicle.id;
      const isElectric = vehicle.isElectric;
      const lat = simState.lat;
      const lng = simState.lng;

      const iconHtml = `
        <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
          ${
            isElectric
              ? `<div class="absolute -inset-2.5 rounded-full bg-emerald-400/40 beacon-wave pointer-events-none"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center transition-all duration-200 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'
          }">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg border ${
              isElectric
                ? 'bg-[#0b1b3d] border-[#00e575] text-white shadow-emerald-500/20'
                : 'bg-white border-slate-200 text-[#111827] shadow-slate-900/10'
            }">
              <div class="w-2 h-2 rounded-full ${isElectric ? 'bg-[#00e575] animate-pulse' : 'bg-blue-600'}"></div>
              <span class="text-[11px] font-bold tracking-tight">${vehicle.routeNumber}</span>
              ${
                isElectric
                  ? '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="#318b68" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>'
                  : ''
              }
            </div>
          </div>
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-xs text-[9px] font-medium text-white px-1.5 py-0.5 rounded shadow pointer-events-none">
            ${vehicle.saccoName.split(' ')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'vehicle-div-icon',
        iconSize: [0, 0],
      });

      if (currentMarkers.has(vehicle.id)) {
        const marker = currentMarkers.get(vehicle.id)!;
        marker.setIcon(customIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setInspectedVehicle(vehicle);
          if (onSelectVehicle) onSelectVehicle(vehicle);
        });
        currentMarkers.set(vehicle.id, marker);
      }
    });
  }, [filteredVehicles, inspectedVehicle, onSelectVehicle]);

  // 3. Smooth Simulated Bus Movement Animation Loop
  useEffect(() => {
    lastTimeRef.current = performance.now();

    const animateLoop = (time: number) => {
      const deltaSeconds = Math.min((time - lastTimeRef.current) / 1000, 0.1); // clamp delta
      lastTimeRef.current = time;

      const simMap = simulationStatesRef.current;
      const markers = vehicleMarkersRef.current;

      simMap.forEach((state, vehicleId) => {
        if (state.isGeometryAvailable && state.geometry && markers.has(vehicleId)) {
          const { lat, lng } = stepVehicleSimulation(state, deltaSeconds);
          const marker = markers.get(vehicleId);
          if (marker) {
            marker.setLatLng([lat, lng]);
          }
        }
      });

      animFrameIdRef.current = requestAnimationFrame(animateLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // 4. Render Transit Stop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const stopMarkers = stopMarkersRef.current;

    if (!showStops) {
      stopMarkers.forEach((marker) => marker.remove());
      stopMarkers.clear();
      return;
    }

    stops.forEach((stop) => {
      if (stopMarkers.has(stop.id)) return;

      const stopHtml = `
        <div class="cursor-pointer group flex items-center justify-center" style="transform: translate(-50%, -50%);">
          <div class="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0b1b3d] shadow-sm flex items-center justify-center transition-all group-hover:scale-130 group-hover:border-[#00e575]">
            <div class="w-1.5 h-1.5 rounded-full bg-[#0b1b3d]"></div>
          </div>
        </div>
      `;

      const stopIcon = L.divIcon({
        html: stopHtml,
        className: 'stop-div-icon',
        iconSize: [0, 0],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);
      marker.bindPopup(
        `<div class="text-xs">
          <div class="font-bold text-slate-900">${stop.name}</div>
          <div class="text-[11px] text-slate-500">${stop.area}</div>
          <div class="mt-1 flex flex-wrap gap-1">
            ${stop.lines.map((l) => `<span class="bg-slate-100 text-[10px] font-semibold px-1 rounded">${l}</span>`).join('')}
          </div>
        </div>`
      );

      marker.on('click', () => {
        if (onSelectStop) onSelectStop(stop);
      });

      stopMarkers.set(stop.id, marker);
    });
  }, [stops, showStops, onSelectStop]);

  // 5. Render Selected Route with Origin & Destination Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up previous route layers
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }
    intermediateMarkersRef.current.forEach((marker) => marker.remove());
    intermediateMarkersRef.current = [];

    if (!selectedRoute && !originStop && !destinationStop) {
      setRouteGeometryMissing(false);
      return;
    }

    const boundsPoints: [number, number][] = [];
    const hasValidRoadGeometry = selectedRoute ? isValidRouteGeometry(selectedRoute) : false;
    setRouteGeometryMissing(Boolean(selectedRoute && !hasValidRoadGeometry));

    // Draw main route polyline strictly when road-following geometry is valid (>= 3 waypoints)
    if (selectedRoute && hasValidRoadGeometry) {
      const polyline = L.polyline(selectedRoute.waypoints, {
        color: selectedRoute.isElectric ? '#00e575' : '#0b1b3d',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;
      boundsPoints.push(...selectedRoute.waypoints);

      // Render intermediate stop dots along the route polyline if present
      if (selectedRoute.stops && selectedRoute.stops.length > 2) {
        const intermediateStops = selectedRoute.stops.slice(1, -1);
        intermediateStops.forEach((interStop) => {
          const interIcon = L.divIcon({
            html: `
              <div class="cursor-pointer group flex items-center justify-center" style="transform: translate(-50%, -50%);">
                <div class="w-3 h-3 rounded-full bg-white border-2 border-[#0b1b3d] shadow-sm flex items-center justify-center ring-2 ring-slate-100 group-hover:scale-125">
                  <div class="w-1 h-1 rounded-full bg-[#00e575]"></div>
                </div>
                <div class="absolute -bottom-4 whitespace-nowrap bg-[#0b1b3d]/90 text-[9px] font-bold text-white px-1 py-0.2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  ${interStop.name.split(' ')[0]}
                </div>
              </div>
            `,
            className: 'route-intermediate-pin',
            iconSize: [0, 0],
          });
          const interMarker = L.marker([interStop.lat, interStop.lng], {
            icon: interIcon,
            zIndexOffset: 100,
          }).addTo(map);

          interMarker.bindPopup(
            `<div class="text-xs">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Intermediate Stage</span>
              <strong class="text-slate-900">${interStop.name}</strong>
              <div class="text-slate-500 text-[11px]">${interStop.area}</div>
            </div>`
          );

          intermediateMarkersRef.current.push(interMarker);
        });
      }
    }

    // Create Origin Pin (Midnight Navy #0b1b3d with START badge)
    const originCoords: [number, number] | null = originStop
      ? [originStop.lat, originStop.lng]
      : selectedRoute
      ? selectedRoute.waypoints[0]
      : null;

    if (originCoords) {
      const originName = originStop ? originStop.name : selectedRoute?.fromStop.name || 'Origin';
      const originIcon = L.divIcon({
        html: `
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0b1b3d] text-white text-[11px] font-bold shadow-xl border-2 border-white whitespace-nowrap z-50 cursor-pointer" style="transform: translate(-50%, -100%);">
            <span class="w-2 h-2 rounded-full bg-white"></span>
            <span>START: ${originName.split(' ')[0]}</span>
          </div>
        `,
        className: 'route-origin-pin',
        iconSize: [0, 0],
      });
      originMarkerRef.current = L.marker(originCoords, { 
        icon: originIcon,
        zIndexOffset: 500,
      }).addTo(map);
      boundsPoints.push(originCoords);
    }

    // Create Destination Pin (Electric Mint #00e575 with DEST badge)
    const destCoords: [number, number] | null = destinationStop
      ? [destinationStop.lat, destinationStop.lng]
      : selectedRoute
      ? selectedRoute.waypoints[selectedRoute.waypoints.length - 1]
      : null;

    if (destCoords) {
      const destName = destinationStop ? destinationStop.name : selectedRoute?.toStop.name || 'Destination';
      const destIcon = L.divIcon({
        html: `
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00e575] text-[#0b1b3d] text-[11px] font-extrabold shadow-xl border-2 border-[#0b1b3d] whitespace-nowrap z-50 cursor-pointer" style="transform: translate(-50%, -100%);">
            <span class="w-2 h-2 rounded-full bg-[#0b1b3d]"></span>
            <span>DEST: ${destName.split(' ')[0]}</span>
          </div>
        `,
        className: 'route-dest-pin',
        iconSize: [0, 0],
      });
      destinationMarkerRef.current = L.marker(destCoords, { 
        icon: destIcon,
        zIndexOffset: 500,
      }).addTo(map);
      boundsPoints.push(destCoords);
    }

    // Fit map bounds to show complete journey without overzooming
    if (boundsPoints.length >= 2) {
      try {
        const bounds = L.latLngBounds(boundsPoints);
        map.fitBounds(bounds, {
          padding: [55, 55],
          maxZoom: 15,
          animate: true,
        });
      } catch {
        // ignore boundary error
      }
    }
  }, [selectedRoute, originStop, destinationStop]);

  // Center on selected vehicle if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicle) return;

    const simState = simulationStatesRef.current.get(selectedVehicle.id);
    const targetLat = simState?.lat ?? selectedVehicle.lat;
    const targetLng = simState?.lng ?? selectedVehicle.lng;

    map.panTo([targetLat, targetLng], {
      animate: true,
      duration: 0.8,
    });
  }, [selectedVehicle]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(NAIROBI_CENTER, 13, { duration: 0.8 });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-[320px] md:h-[400px] min-h-[300px] overflow-hidden rounded-3xl border border-[#e5e7eb] shadow-xs bg-[#f6f8fa] flex flex-col">
      {/* Map Tile & Key Error Notice */}
      {mapError && (
        <div className="absolute top-3 left-3 right-16 z-30 bg-amber-50/95 backdrop-blur-md border border-amber-300 rounded-2xl p-2.5 shadow-md flex items-start gap-2 text-xs text-amber-900 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-tight">
            <span className="font-bold block">MapTiler Status</span>
            <span>{mapError}</span>
          </div>
          <button
            onClick={() => setMapError(null)}
            className="text-amber-700 hover:text-amber-950 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Route Geometry Unavailable Overlay */}
      {routeGeometryMissing && (
        <div className="absolute top-14 left-3 right-16 z-30 bg-rose-50/95 backdrop-blur-md border border-rose-300 rounded-2xl p-2.5 shadow-md flex items-start gap-2 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-tight">
            <span className="font-bold block">Route Geometry Unavailable</span>
            <span>Road-following path data is unavailable for this route. Straight-line fallback is disabled.</span>
          </div>
        </div>
      )}

      {/* Actual Interactive Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          aria-label="Re-center Nairobi map"
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md text-[#0b1b3d] shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
          title="Center Nairobi CBD"
        >
          <Navigation2 className="w-4 h-4 text-[#0b1b3d]" />
        </button>

        {/* Zoom In/Out Buttons */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-full shadow-md border border-slate-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg border-b border-slate-100"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg"
          >
            &minus;
          </button>
        </div>

        {/* Toggle Transit Stops */}
        <button
          onClick={() => setShowStops((prev) => !prev)}
          aria-label="Toggle stops"
          className={`w-10 h-10 rounded-full backdrop-blur-md shadow-md border flex items-center justify-center transition-all ${
            showStops
              ? 'bg-[#0b1b3d] text-white border-[#0b1b3d]'
              : 'bg-white/95 text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Transit Stages"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Inspected Bus Information Card (Requirement 4) */}
      {inspectedVehicle && (
        <div className="absolute bottom-12 left-3 right-3 z-30 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200 shadow-xl max-w-sm mx-auto animate-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  inspectedVehicle.isElectric
                    ? 'bg-[#0b1b3d] text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {inspectedVehicle.routeNumber}
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>{inspectedVehicle.plate}</span>
                  {inspectedVehicle.isElectric && (
                    <span className="text-[10px] font-bold text-[#006d43] bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      <span className="inline-flex items-center gap-0.5">
                        <Zap className="w-3 h-3" aria-hidden="true" />
                        Electric
                      </span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {inspectedVehicle.saccoName} • To {inspectedVehicle.destination}
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectedVehicle(null)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-800">{inspectedVehicle.seatsAvailable}</span> free
              </span>
              {inspectedVehicle.isElectric && inspectedVehicle.batteryPct && (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{inspectedVehicle.batteryPct}%</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-500">
                <Gauge className="w-3.5 h-3.5" />
                <span>{inspectedVehicle.speed} km/h</span>
              </span>
            </div>

            <span className="font-extrabold text-[#006d43] bg-emerald-50 px-2 py-0.5 rounded-full">
              ~{inspectedVehicle.demoEtaMinutes} min away
            </span>
          </div>
        </div>
      )}

      {/* Prominent DEMO SIMULATION Label (Requirement 5) */}
      <div className="absolute bottom-2 left-3 right-3 z-20 pointer-events-none flex items-center justify-between">
        <div className="pointer-events-auto bg-[#0b1b3d]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-slate-700/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e575]"></span>
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300">
            DEMO SIMULATION
          </span>
          <span className="hidden sm:inline text-[10px] text-slate-300">
            • {filteredVehicles.length} vehicles moving along Nairobi route coordinates
          </span>
        </div>

        <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-slate-500 font-medium border border-slate-200">
          {tileProviderName}
        </div>
      </div>
    </div>
  );
};
