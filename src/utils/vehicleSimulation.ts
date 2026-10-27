/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, RouteOption } from '../types/transit';
import { MOCK_ROUTES, MOCK_VEHICLES } from '../data/mockData';

export interface AnimatedVehicleState {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  progress: number; // 0.0 to 1.0 along the route path
  direction: 1 | -1; // 1 = forward, -1 = reverse
  waypoints: [number, number][];
}

// Fallback waypoints for vehicles whose routes might not be in MOCK_ROUTES
const DEFAULT_CORRIDOR_WAYPOINTS: Record<string, [number, number][]> = {
  'MT-46': [
    [-1.2844, 36.8249], // Kencom
    [-1.2810, 36.8215],
    [-1.2742, 36.8142], // Museum Hill
    [-1.2655, 36.8048], // Westlands
    [-1.2600, 36.7800], // Kangemi
    [-1.2585, 36.7320], // Uthiru
  ],
  'KBS-12': [
    [-1.2868, 36.8272], // Ambassadeur
    [-1.2912, 36.8285], // Railways
    [-1.2950, 36.8210],
    [-1.2982, 36.8155], // Upper Hill
    [-1.3050, 36.8100],
    [-1.3150, 36.8050], // South C / Langata
  ],
};

/**
 * Initializes simulation path state for all vehicles based on their route waypoints
 */
export function initializeVehicleSimulation(vehicles: Vehicle[], routes: RouteOption[]): Map<string, AnimatedVehicleState> {
  const map = new Map<string, AnimatedVehicleState>();

  vehicles.forEach((vehicle, index) => {
    // Find matching route by routeCode or sacco
    const route = routes.find((r) => r.routeCode === vehicle.routeNumber);
    let waypoints = route?.waypoints;

    if (!waypoints || waypoints.length < 2) {
      waypoints = DEFAULT_CORRIDOR_WAYPOINTS[vehicle.routeNumber] || [
        [-1.286389, 36.817223],
        [-1.2785, 36.8182],
        [-1.2655, 36.8048],
      ];
    }

    // Stagger initial progress based on vehicle index so they don't bunch up
    const initialProgress = ((index * 0.23 + 0.15) % 0.85) + 0.05;
    const initialDirection = index % 2 === 0 ? 1 : -1;

    const initialPos = interpolatePath(waypoints, initialProgress);

    map.set(vehicle.id, {
      id: vehicle.id,
      lat: initialPos.lat,
      lng: initialPos.lng,
      heading: initialPos.heading,
      speed: vehicle.speed || 35,
      progress: initialProgress,
      direction: initialDirection,
      waypoints,
    });
  });

  return map;
}

/**
 * Advances the simulation by delta time (seconds) and returns new vehicle position & heading
 */
export function stepVehicleSimulation(
  state: AnimatedVehicleState,
  deltaSeconds: number
): { lat: number; lng: number; heading: number } {
  // Compute step size: 1.0 is full route length. Average route is ~8km.
  // Speed is km/h -> km/s = speed / 3600. Fraction = (speed / 3600) / 8km
  const normalizedSpeed = (state.speed / 3600 / 8) * 1.5; // Slightly accelerated for pleasant demo experience
  let newProgress = state.progress + state.direction * normalizedSpeed * deltaSeconds;

  // Smooth bounce when reaching terminals
  if (newProgress >= 1.0) {
    newProgress = 1.0;
    state.direction = -1;
  } else if (newProgress <= 0.0) {
    newProgress = 0.0;
    state.direction = 1;
  }

  state.progress = newProgress;

  const { lat, lng, heading } = interpolatePath(state.waypoints, state.progress, state.direction);
  state.lat = lat;
  state.lng = lng;
  state.heading = heading;

  return { lat, lng, heading };
}

/**
 * Linear interpolation along a multi-segment geographic polyline path
 */
function interpolatePath(
  waypoints: [number, number][],
  progress: number,
  direction: 1 | -1 = 1
): { lat: number; lng: number; heading: number } {
  if (waypoints.length === 0) {
    return { lat: -1.286389, lng: 36.817223, heading: 0 };
  }
  if (waypoints.length === 1) {
    return { lat: waypoints[0][0], lng: waypoints[0][1], heading: 0 };
  }

  // Calculate cumulative distances between each segment
  const segmentDistances: number[] = [];
  let totalDistance = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const dLat = waypoints[i + 1][0] - waypoints[i][0];
    const dLng = waypoints[i + 1][1] - waypoints[i][1];
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    segmentDistances.push(dist);
    totalDistance += dist;
  }

  if (totalDistance === 0) {
    return { lat: waypoints[0][0], lng: waypoints[0][1], heading: 0 };
  }

  const targetDistance = Math.max(0, Math.min(1, progress)) * totalDistance;

  let accumulated = 0;
  for (let i = 0; i < segmentDistances.length; i++) {
    const segDist = segmentDistances[i];
    if (accumulated + segDist >= targetDistance || i === segmentDistances.length - 1) {
      const segT = segDist === 0 ? 0 : (targetDistance - accumulated) / segDist;
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      const lat = p1[0] + segT * (p2[0] - p1[0]);
      const lng = p1[1] + segT * (p2[1] - p1[1]);

      // Heading calculation in degrees from north
      const dLat = (p2[0] - p1[0]) * (direction === 1 ? 1 : -1);
      const dLng = (p2[1] - p1[1]) * (direction === 1 ? 1 : -1);
      const heading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

      return { lat, lng, heading };
    }
    accumulated += segDist;
  }

  const last = waypoints[waypoints.length - 1];
  return { lat: last[0], lng: last[1], heading: 0 };
}
