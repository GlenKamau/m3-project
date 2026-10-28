/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Step-by-Step Journey Directions & Route Comparison Helpers for m3
 * Builds accurate sequential commuter instructions strictly from route stop records,
 * validates road-following route geometry, and sorts routes without treating missing
 * fares or durations as zero.
 */

import {
  RouteOption,
  JourneyDirectionStep,
  RouteSortMode,
} from '../types/transit';

/**
 * Validates that a RouteOption has a complete road-following geometry polyline.
 * Rejects missing waypoints, NaN coordinates, or 2-point straight-line fallbacks.
 */
export function isValidRouteGeometry(route: RouteOption | null | undefined): boolean {
  if (!route || !Array.isArray(route.waypoints)) {
    return false;
  }

  // A road-following route in Nairobi must have at least 3 ordered coordinates
  // (never a 2-point straight line between origin and destination)
  if (route.waypoints.length < 3) {
    return false;
  }

  for (const pt of route.waypoints) {
    if (
      !Array.isArray(pt) ||
      pt.length < 2 ||
      typeof pt[0] !== 'number' ||
      typeof pt[1] !== 'number' ||
      isNaN(pt[0]) ||
      isNaN(pt[1]) ||
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
 * Checks whether a numeric metric (fare or duration) is present and valid (> 0).
 * Ensures missing or null/undefined values are never treated as zero.
 */
export function isValidPositiveMetric(value: number | null | undefined): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0;
}

/**
 * Format duration safely for UI display.
 */
export function formatRouteDuration(durationMinutes: number | null | undefined): string {
  if (!isValidPositiveMetric(durationMinutes)) {
    return 'Duration unavailable';
  }
  return `~${Math.round(durationMinutes)} min`;
}

/**
 * Format demo fare safely for UI display.
 */
export function formatRouteFare(demoFareKes: number | null | undefined): string {
  if (!isValidPositiveMetric(demoFareKes)) {
    return 'Fare unavailable';
  }
  return `KES ${Math.round(demoFareKes)}`;
}

/**
 * Builds clear, sequential step-by-step journey directions from the selected route's
 * actual stops, SACCO record, and optional transfer metadata.
 * Does not invent stops, transfers, or fares.
 */
export function buildJourneyDirections(
  route: RouteOption,
  originLabel?: string,
  destinationLabel?: string
): JourneyDirectionStep[] {
  const steps: JourneyDirectionStep[] = [];
  const stops = Array.isArray(route.stops) && route.stops.length >= 2
    ? route.stops
    : [route.fromStop, route.toStop];

  const boardingStop = stops[0];
  const alightingStop = stops[stops.length - 1];
  const intermediateStops = stops.slice(1, -1);

  const cleanOrigin = originLabel?.trim() || boardingStop.name;
  const cleanDest = destinationLabel?.trim() || alightingStop.name;

  let stepCounter = 1;

  // Step 1: Starting location & walk to boarding stage
  const walkInfo =
    typeof route.walkMinutes === 'number' && route.walkMinutes > 0
      ? ` (~${route.walkMinutes} min walk)`
      : '';
  steps.push({
    stepNumber: stepCounter++,
    type: 'origin',
    title: `Start at ${cleanOrigin}`,
    instruction:
      cleanOrigin.toLowerCase() === boardingStop.name.toLowerCase()
        ? `Head to the designated ${route.saccoName} boarding bay at ${boardingStop.name} (${boardingStop.area})${walkInfo}.`
        : `Proceed from ${cleanOrigin} to the boarding stage at ${boardingStop.name} (${boardingStop.area})${walkInfo}.`,
    stop: boardingStop,
  });

  // Step 2: Boarding instruction at first stop
  const fareNote = isValidPositiveMetric(route.demoFareKes)
    ? ` Estimated demo fare: KES ${route.demoFareKes}.`
    : ' Confirm current fare with the stage marshal or conductor before boarding.';

  steps.push({
    stepNumber: stepCounter++,
    type: 'board',
    title: `Board ${route.saccoName} • Route ${route.routeCode}`,
    instruction: `At ${boardingStop.name} (${boardingStop.area}), board ${route.saccoName} (${route.name}, code ${route.routeCode}) heading towards ${alightingStop.name}.${fareNote}`,
    stop: boardingStop,
    saccoName: route.saccoName,
    routeCode: route.routeCode,
  });

  // Step 3+: Ordered intermediate stops and any transfer point
  intermediateStops.forEach((interStop, idx) => {
    const isTransferHub =
      route.transferInfo &&
      route.transferInfo.transferStop.id === interStop.id;

    if (isTransferHub && route.transferInfo) {
      steps.push({
        stepNumber: stepCounter++,
        type: 'transfer',
        title: `Transfer at ${interStop.name} (${interStop.area})`,
        instruction:
          route.transferInfo.notes ||
          `Alight at ${interStop.name} and transfer to ${route.transferInfo.nextSaccoName} route ${route.transferInfo.nextRouteCode} heading towards ${alightingStop.name}.`,
        stop: interStop,
        saccoName: route.transferInfo.nextSaccoName,
        routeCode: route.transferInfo.nextRouteCode,
        transferInfo: route.transferInfo,
      });
    } else {
      steps.push({
        stepNumber: stepCounter++,
        type: 'intermediate',
        title: `Pass through ${interStop.name}`,
        instruction: `Intermediate stop ${idx + 1} of ${intermediateStops.length} (${interStop.area}). Stay onboard unless transferring.`,
        stop: interStop,
        saccoName: route.saccoName,
        routeCode: route.routeCode,
      });
    }
  });

  // Step N-1: Alighting stop
  steps.push({
    stepNumber: stepCounter++,
    type: 'alight',
    title: `Alight at ${alightingStop.name}`,
    instruction: `Notify the conductor ("Shukisha") as you approach ${alightingStop.name} (${alightingStop.area}) and exit safely at the designated stage.`,
    stop: alightingStop,
    saccoName: route.transferInfo ? route.transferInfo.nextSaccoName : route.saccoName,
    routeCode: route.transferInfo ? route.transferInfo.nextRouteCode : route.routeCode,
  });

  // Step N: Final destination arrival
  steps.push({
    stepNumber: stepCounter++,
    type: 'destination',
    title: `Arrive at ${cleanDest}`,
    instruction:
      cleanDest.toLowerCase() === alightingStop.name.toLowerCase()
        ? `You have reached your destination at ${alightingStop.name} (${alightingStop.area}).`
        : `Walk from ${alightingStop.name} to your final destination at ${cleanDest}.`,
    stop: alightingStop,
  });

  return steps;
}

/**
 * Sorts route options according to the chosen comparison mode.
 * Crucial safeguard: Missing/null/undefined/<=0 fares or durations are NEVER treated as 0;
 * they are always sorted after valid positive metrics so incomplete data never falsely
 * ranks as "Cheapest" or "Fastest".
 */
export function sortRouteOptions(
  routes: RouteOption[],
  mode: RouteSortMode,
  preferredSaccoIds: string[] = [],
  prioritizePreferred = false
): RouteOption[] {
  const copy = [...routes];

  copy.sort((a, b) => {
    if (mode === 'fastest') {
      const aValid = isValidPositiveMetric(a.durationMinutes);
      const bValid = isValidPositiveMetric(b.durationMinutes);
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      if (aValid && bValid && a.durationMinutes !== b.durationMinutes) {
        return (a.durationMinutes as number) - (b.durationMinutes as number);
      }
    } else if (mode === 'cheapest') {
      const aValid = isValidPositiveMetric(a.demoFareKes);
      const bValid = isValidPositiveMetric(b.demoFareKes);
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      if (aValid && bValid && a.demoFareKes !== b.demoFareKes) {
        return (a.demoFareKes as number) - (b.demoFareKes as number);
      }
    } else if (mode === 'transfers') {
      const aTransfers = typeof a.transfersCount === 'number' ? a.transfersCount : (a.transferInfo ? 1 : 0);
      const bTransfers = typeof b.transfersCount === 'number' ? b.transfersCount : (b.transferInfo ? 1 : 0);
      if (aTransfers !== bTransfers) {
        return aTransfers - bTransfers;
      }
    }

    // Default / tie-breaker: respect preferred SACCO prioritization when enabled
    if (prioritizePreferred && preferredSaccoIds.length > 0) {
      const aFav = preferredSaccoIds.includes(a.saccoId) ? 1 : 0;
      const bFav = preferredSaccoIds.includes(b.saccoId) ? 1 : 0;
      if (bFav !== aFav) return bFav - aFav;
    }

    // Secondary tie-breaker: valid duration
    const aDur = isValidPositiveMetric(a.durationMinutes) ? (a.durationMinutes as number) : Number.MAX_SAFE_INTEGER;
    const bDur = isValidPositiveMetric(b.durationMinutes) ? (b.durationMinutes as number) : Number.MAX_SAFE_INTEGER;
    return aDur - bDur;
  });

  return copy;
}
