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
 * Validates that a waypoint sequence represents a multi-segment road-following geometry
 * (at least 3 valid [lat, lng] coordinates) and never a 2-point straight-line fallback.
 */
export function hasValidRoadWaypoints(waypoints: [number, number][] | null | undefined): boolean {
  if (!Array.isArray(waypoints) || waypoints.length < 3) {
    return false;
  }

  for (const pt of waypoints) {
    if (
      !Array.isArray(pt) ||
      pt.length < 2 ||
      typeof pt[0] !== 'number' ||
      typeof pt[1] !== 'number' ||
      isNaN(pt[0]) ||
      isNaN(pt[1]) ||
      !isFinite(pt[0]) ||
      !isFinite(pt[1]) ||
      pt[0] < -90 ||
      pt[0] > 90 ||
      pt[1] < -180 ||
      pt[1] > 180
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Pre-computes cumulative segment distances for a route's sequence of geographic coordinates.
 * Rejects 2-point straight lines or invalid coordinate sequences.
 */
export function buildRouteGeometry(routeId: string, waypoints: [number, number][]): RouteGeometryData {
  if (routeGeometryCache.has(routeId)) {
    const cached = routeGeometryCache.get(routeId)!;
    if (
      cached.totalDistanceMeters > 0 &&
      Array.isArray(waypoints) &&
      cached.waypoints.length === waypoints.length
    ) {
      return cached;
    }
  }

  if (!hasValidRoadWaypoints(waypoints)) {
    return {
      routeId,
      waypoints: [],
      segmentDistances: [],
      cumulativeDistances: [0],
      totalDistanceMeters: 0,
    };
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

  if (accumulated > 0) {
    routeGeometryCache.set(routeId, geomData);
  }
  return geomData;
}

/**
 * Projects a geographic coordinate (lat, lng) onto the closest road segment of a RouteGeometryData,
 * returning the cumulative distance along the route and the perpendicular offset in meters.
 */
export function projectPointOntoRouteGeometry(
  geom: RouteGeometryData,
  lat: number,
  lng: number
): { distanceMeters: number; minOffsetMeters: number } {
  const { waypoints, segmentDistances, cumulativeDistances, totalDistanceMeters } = geom;
  if (waypoints.length < 2 || totalDistanceMeters <= 0) {
    return { distanceMeters: 0, minOffsetMeters: Infinity };
  }

  let bestDistanceAlongRoute = 0;
  let minOffsetMeters = Infinity;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const pA = waypoints[i];
    const pB = waypoints[i + 1];
    const segLen = segmentDistances[i];
    if (segLen <= 0) continue;

    const dLat = pB[0] - pA[0];
    const dLng = pB[1] - pA[1];
    const lenSq = dLat * dLat + dLng * dLng;

    const t =
      lenSq > 0
        ? Math.max(0, Math.min(1, ((lat - pA[0]) * dLat + (lng - pA[1]) * dLng) / lenSq))
        : 0;

    const projLat = pA[0] + t * dLat;
    const projLng = pA[1] + t * dLng;
    const offsetMeters = computeHaversineDistanceMeters(lat, lng, projLat, projLng);

    if (offsetMeters < minOffsetMeters) {
      minOffsetMeters = offsetMeters;
      bestDistanceAlongRoute = cumulativeDistances[i] + t * segLen;
    }
  }

  return {
    distanceMeters: Math.max(0, Math.min(bestDistanceAlongRoute, totalDistanceMeters)),
    minOffsetMeters,
  };
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
  const staggerFractions = [0.18, 0.42, 0.68, 0.88, 0.28, 0.55, 0.75, 0.35];

  vehicles.forEach((vehicle, index) => {
    // Look up assigned route by vehicle.routeId or routeNumber
    let route = routes.find((r) => r.id === vehicle.routeId);
    if (!route) {
      route = routes.find((r) => r.routeCode === vehicle.routeNumber);
    }

    // If state already exists for this stable bus ID and its valid route geometry is unchanged,
    // preserve its active progress & direction across React renders and filter toggles
    if (persistentVehicleStates.has(vehicle.id)) {
      const existing = persistentVehicleStates.get(vehicle.id)!;
      if (
        existing.isGeometryAvailable &&
        existing.geometry &&
        route &&
        existing.routeId === route.id &&
        existing.geometry.waypoints.length === route.waypoints.length
      ) {
        existing.speedKmH = vehicle.speed || existing.speedKmH;
        existing.destination = vehicle.destination || existing.destination;
        return;
      }
    }

    if (!route || !hasValidRoadWaypoints(route.waypoints)) {
      // Route geometry is unavailable or invalid (< 3 road points). Do NOT create straight-line fallback.
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
    if (geometry.totalDistanceMeters <= 0) {
      persistentVehicleStates.set(vehicle.id, {
        id: vehicle.id,
        plate: vehicle.plate,
        saccoId: vehicle.saccoId,
        saccoName: vehicle.saccoName,
        routeId: route.id,
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

    // Project the vehicle's starting coordinate onto its assigned road geometry
    const projection = projectPointOntoRouteGeometry(geometry, vehicle.lat, vehicle.lng);
    const hasInteriorProjection =
      projection.minOffsetMeters <= 500 &&
      projection.distanceMeters > 20 &&
      projection.distanceMeters < geometry.totalDistanceMeters - 20;

    const initialFraction = staggerFractions[index % staggerFractions.length];
    const initialDistance = hasInteriorProjection
      ? projection.distanceMeters
      : initialFraction * geometry.totalDistanceMeters;
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
