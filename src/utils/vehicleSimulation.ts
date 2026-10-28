/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, RouteOption } from '../types/transit';
import { MOCK_ROUTES } from '../data/mockData';

export interface RouteGeometryData {
  routeId: string;
  waypoints: [number, number][];
  segmentDistances: number[]; // Distance in meters between consecutive points
  cumulativeDistances: number[]; // Cumulative distance in meters from start [0, d1, d1+d2, ...]
  totalDistanceMeters: number;
}

export interface AnimatedVehicleState {
  id: string; // Stable vehicle ID
  plate: string;
  saccoId: string;
  saccoName: string;
  routeId: string; // Assigned route ID
  routeNumber: string;
  destination: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmH: number;
  currentDistanceMeters: number;
  direction: 1 | -1; // 1 = forward along waypoints, -1 = reverse
  isGeometryAvailable: boolean;
  geometry: RouteGeometryData | null;
}

// Module-level persistent cache for route geometries and vehicle simulation states
const routeGeometryCache = new Map<string, RouteGeometryData>();
const persistentVehicleStates = new Map<string, AnimatedVehicleState>();

/**
 * Calculates accurate geodesic Haversine distance in meters between two lat/lng coordinates
 */
export function computeHaversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Pre-computes cumulative segment distances for a route's sequence of geographic coordinates
 */
export function buildRouteGeometry(routeId: string, waypoints: [number, number][]): RouteGeometryData {
  if (routeGeometryCache.has(routeId)) {
    return routeGeometryCache.get(routeId)!;
  }

  if (!waypoints || waypoints.length < 2) {
    const emptyGeom: RouteGeometryData = {
      routeId,
      waypoints: waypoints || [],
      segmentDistances: [],
      cumulativeDistances: [0],
      totalDistanceMeters: 0,
    };
    routeGeometryCache.set(routeId, emptyGeom);
    return emptyGeom;
  }

  const segmentDistances: number[] = [];
  const cumulativeDistances: number[] = [0];
  let accumulated = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const dist = computeHaversineDistanceMeters(p1[0], p1[1], p2[0], p2[1]);
    segmentDistances.push(dist);
    accumulated += dist;
    cumulativeDistances.push(accumulated);
  }

  const geomData: RouteGeometryData = {
    routeId,
    waypoints,
    segmentDistances,
    cumulativeDistances,
    totalDistanceMeters: accumulated,
  };

  routeGeometryCache.set(routeId, geomData);
  return geomData;
}

/**
 * Interpolates position strictly within the single route segment containing the given distance.
 * Never interpolates directly between the route's overall start and end points.
 */
export function calculatePositionAtDistance(
  geom: RouteGeometryData,
  distanceMeters: number,
  direction: 1 | -1
): { lat: number; lng: number; heading: number } {
  const { waypoints, segmentDistances, cumulativeDistances, totalDistanceMeters } = geom;

  if (waypoints.length === 0) {
    return { lat: -1.286389, lng: 36.817223, heading: 0 };
  }
  if (waypoints.length === 1 || totalDistanceMeters === 0) {
    return { lat: waypoints[0][0], lng: waypoints[0][1], heading: 0 };
  }

  // Clamp distance strictly to route bounds
  const clampedDistance = Math.max(0, Math.min(distanceMeters, totalDistanceMeters));

  // Find the exact segment [k, k+1] containing clampedDistance
  let k = 0;
  while (k < segmentDistances.length - 1 && cumulativeDistances[k + 1] < clampedDistance) {
    k++;
  }

  const pA = waypoints[k];
  const pB = waypoints[k + 1];
  const segmentLength = segmentDistances[k];
  const offsetIntoSegment = clampedDistance - cumulativeDistances[k];

  // Fraction strictly within segment [0, 1]
  const segmentFraction = segmentLength > 0 ? Math.max(0, Math.min(1, offsetIntoSegment / segmentLength)) : 0;

  const lat = pA[0] + segmentFraction * (pB[0] - pA[0]);
  const lng = pA[1] + segmentFraction * (pB[1] - pA[1]);

  // Directional bearing along the road segment
  const dLat = (pB[0] - pA[0]) * direction;
  const dLng = (pB[1] - pA[1]) * direction;
  const heading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

  return { lat, lng, heading };
}

/**
 * Initializes or retrieves persistent simulation states for vehicles.
 * Preserves existing vehicle positions across React renders, SACCO filter changes, and tab switches.
 */
export function initializeVehicleSimulation(
  vehicles: Vehicle[],
  routes: RouteOption[] = MOCK_ROUTES
): Map<string, AnimatedVehicleState> {
  vehicles.forEach((vehicle, index) => {
    // If state already exists for this stable bus ID, preserve its active progress & direction
    if (persistentVehicleStates.has(vehicle.id)) {
      const existing = persistentVehicleStates.get(vehicle.id)!;
      // Sync metadata in case speed or plate was updated
      existing.speedKmH = vehicle.speed || existing.speedKmH;
      return;
    }

    // Look up assigned route by vehicle.routeId
    let route = routes.find((r) => r.id === vehicle.routeId);
    if (!route) {
      // Fallback matching by routeNumber
      route = routes.find((r) => r.routeCode === vehicle.routeNumber);
    }

    if (!route || !route.waypoints || route.waypoints.length < 2) {
      // Route geometry is unavailable. Do NOT create straight line fallback.
      persistentVehicleStates.set(vehicle.id, {
        id: vehicle.id,
        plate: vehicle.plate,
        saccoId: vehicle.saccoId,
        saccoName: vehicle.saccoName,
        routeId: vehicle.routeId || '',
        routeNumber: vehicle.routeNumber,
        destination: vehicle.destination,
        lat: vehicle.lat,
        lng: vehicle.lng,
        heading: vehicle.heading || 0,
        speedKmH: 0,
        currentDistanceMeters: 0,
        direction: 1,
        isGeometryAvailable: false,
        geometry: null,
      });
      return;
    }

    // Pre-calculate cumulative route segment distances
    const geometry = buildRouteGeometry(route.id, route.waypoints);

    // Stagger initial positions so buses on the same route are distributed along the road
    const staggerFractions = [0.18, 0.42, 0.68, 0.88, 0.28, 0.55, 0.75, 0.35];
    const initialFraction = staggerFractions[index % staggerFractions.length];
    const initialDistance = initialFraction * geometry.totalDistanceMeters;
    const initialDirection: 1 | -1 = index % 2 === 0 ? 1 : -1;

    const initialPos = calculatePositionAtDistance(geometry, initialDistance, initialDirection);

    persistentVehicleStates.set(vehicle.id, {
      id: vehicle.id,
      plate: vehicle.plate,
      saccoId: vehicle.saccoId,
      saccoName: vehicle.saccoName,
      routeId: route.id,
      routeNumber: vehicle.routeNumber,
      destination: vehicle.destination,
      lat: initialPos.lat,
      lng: initialPos.lng,
      heading: initialPos.heading,
      speedKmH: vehicle.speed || 40,
      currentDistanceMeters: initialDistance,
      direction: initialDirection,
      isGeometryAvailable: true,
      geometry,
    });
  });

  return persistentVehicleStates;
}

/**
 * Advances a bus by deltaSeconds along its assigned route segments.
 * Smoothly reverses direction when reaching route endpoints.
 */
export function stepVehicleSimulation(
  state: AnimatedVehicleState,
  deltaSeconds: number
): { lat: number; lng: number; heading: number } {
  if (!state.isGeometryAvailable || !state.geometry || state.geometry.totalDistanceMeters === 0) {
    return { lat: state.lat, lng: state.lng, heading: state.heading };
  }

  // Convert speed (km/h) to m/s, applying a 2.5x simulation multiplier for smooth, observable demo movement
  const speedMetersPerSecond = (state.speedKmH * 1000) / 3600;
  const simulationSpeedMultiplier = 2.5;
  const distanceStep = speedMetersPerSecond * simulationSpeedMultiplier * deltaSeconds;

  let newDistance = state.currentDistanceMeters + state.direction * distanceStep;
  const maxDistance = state.geometry.totalDistanceMeters;

  // Seamless turnaround when reaching the start or end of the route
  if (newDistance >= maxDistance) {
    newDistance = maxDistance;
    state.direction = -1;
  } else if (newDistance <= 0) {
    newDistance = 0;
    state.direction = 1;
  }

  state.currentDistanceMeters = newDistance;

  // Calculate new coordinates strictly within the current road segment
  const { lat, lng, heading } = calculatePositionAtDistance(state.geometry, newDistance, state.direction);
  state.lat = lat;
  state.lng = lng;
  state.heading = heading;

  return { lat, lng, heading };
}
