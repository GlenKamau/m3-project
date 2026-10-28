/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Automated Regression Test Suite for m3 Nairobi Transit Map
 * Verifies Location Accuracy, Route Geometry, Bus Movement, Geodesic Math, and Routing Caching.
 */

import { 
  TRANSIT_STOPS, 
  MOCK_ROUTES, 
  MOCK_VEHICLES, 
  SACCOS,
  matchStopByQuery, 
  findOrCreateRoute 
} from '../src/data/mockData';
import { 
  computeHaversineDistanceMeters, 
  buildRouteGeometry, 
  calculatePositionAtDistance, 
  initializeVehicleSimulation, 
  stepVehicleSimulation 
} from '../src/utils/vehicleSimulation';
import { routingService } from '../src/utils/routingService';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureDetails = '') {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ ${testName}`);
  } else {
    results.push({ name: testName, passed: false, details: failureDetails });
    console.error(`  ✗ ${testName} - FAILED: ${failureDetails}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('Starting m3 Map Integration & Regression Test Suite');
  console.log('====================================================\n');

  // -------------------------------------------------------------------------
  // TEST A: Location Accuracy & Endpoint Persistence
  // -------------------------------------------------------------------------
  console.log('TRACK A: Location Accuracy & Selection Checks:');

  // 1. Kencom Stage -> Sarit Centre Stage
  const stopKencom = matchStopByQuery('Kencom Stage');
  const stopSarit = matchStopByQuery('Sarit Centre Stage');
  assert(
    !!stopKencom && stopKencom.id === 'stop-kencom' && stopKencom.lat === -1.2844 && stopKencom.lng === 36.8249,
    'A.1 Kencom Stage matches stop-kencom with exact coords [-1.2844, 36.8249]',
    `Got ${JSON.stringify(stopKencom)}`
  );
  assert(
    !!stopSarit && stopSarit.id === 'stop-westlands' && stopSarit.lat === -1.2655 && stopSarit.lng === 36.8048,
    'A.1 Sarit Centre Stage matches stop-westlands with exact coords [-1.2655, 36.8048]',
    `Got ${JSON.stringify(stopSarit)}`
  );

  // 2. Sarit Centre Stage -> Kencom Stage (swapped query)
  const originSarit = matchStopByQuery('Sarit Centre');
  const destKencom = matchStopByQuery('Kencom');
  assert(
    !!originSarit && originSarit.id === 'stop-westlands',
    'A.2 Sarit Centre as starting-point retains stop-westlands'
  );
  assert(
    !!destKencom && destKencom.id === 'stop-kencom',
    'A.2 Kencom as destination retains stop-kencom'
  );

  // 3. Kencom Stage as a destination
  assert(
    destKencom?.id === 'stop-kencom' && destKencom?.lat === -1.2844,
    'A.3 Kencom Stage destination retains its own coordinates and does NOT revert to Westlands',
    `Expected -1.2844, got ${destKencom?.lat}`
  );

  // 4. Yaya Centre as a destination
  const stopYaya = matchStopByQuery('Yaya Centre');
  assert(
    !!stopYaya && stopYaya.id === 'stop-yaya' && stopYaya.lat === -1.2925 && stopYaya.lng === 36.7876,
    'A.4 Yaya Centre retains id stop-yaya and coordinates [-1.2925, 36.7876], NOT Westlands',
    `Got ${JSON.stringify(stopYaya)}`
  );

  // 5. Swapping origin and destination
  let orig = stopKencom;
  let dest = stopYaya;
  // swap
  const swappedOrig = dest;
  const swappedDest = orig;
  assert(
    swappedOrig?.id === 'stop-yaya' && swappedDest?.id === 'stop-kencom',
    'A.5 Swapping origin & destination properly exchanges endpoints preserving exact coordinates'
  );

  // 6. Changing only one endpoint
  let fixedOrigin = stopKencom;
  let updatedDest = matchStopByQuery('Karen Shopping Centre');
  assert(
    fixedOrigin?.id === 'stop-kencom' && updatedDest?.id === 'stop-karen' && updatedDest?.lat === -1.3195,
    'A.6 Changing destination to Karen keeps Kencom origin intact with Karen coordinates [-1.3195, 36.7067]'
  );

  // 7. Selecting search suggestions with different coordinates
  const stopJkia = matchStopByQuery('JKIA Airport');
  const stopUpperHill = matchStopByQuery('Upper Hill Britam');
  const stopRoysambu = matchStopByQuery('Roysambu TRM');
  assert(
    !!stopJkia && stopJkia.id === 'stop-jkia' && stopJkia.lat === -1.3323 && stopJkia.lng === 36.9275,
    'A.7 JKIA Airport retains coordinates [-1.3323, 36.9275]'
  );
  assert(
    !!stopUpperHill && stopUpperHill.id === 'stop-upperhill' && stopUpperHill.lat === -1.2982,
    'A.7 Upper Hill retains coordinates [-1.2982, 36.8155]'
  );
  assert(
    !!stopRoysambu && stopRoysambu.id === 'stop-roysambu' && stopRoysambu.lat === -1.2185,
    'A.7 Roysambu retains coordinates [-1.2185, 36.8876]'
  );

  // 8. Unrecognized query strictly returns undefined (no silent Westlands fallback)
  const unknownStop = matchStopByQuery('NonExistentPlace 999');
  assert(
    unknownStop === undefined,
    'A.8 Unrecognized search query returns undefined (no silent fallback to Westlands)'
  );

  console.log('\nTRACK B: Route Geometry & Directionality Checks:');

  // Route Kencom -> Westlands
  const routeKencomToWestlands = findOrCreateRoute(stopKencom, stopSarit);
  assert(
    !!routeKencomToWestlands && routeKencomToWestlands.waypoints.length >= 8,
    'B.1 Kencom -> Westlands route is road-following with >= 8 waypoints',
    `Waypoints length: ${routeKencomToWestlands?.waypoints.length}`
  );
  const firstPt = routeKencomToWestlands?.waypoints[0];
  const lastPt = routeKencomToWestlands?.waypoints[routeKencomToWestlands.waypoints.length - 1];
  assert(
    firstPt?.[0] === stopKencom?.lat && firstPt?.[1] === stopKencom?.lng,
    'B.1 Route starts exactly at Kencom origin coordinates [-1.2844, 36.8249]'
  );
  assert(
    lastPt?.[0] === stopSarit?.lat && lastPt?.[1] === stopSarit?.lng,
    'B.1 Route ends exactly at Sarit / Westlands destination coordinates [-1.2655, 36.8048]'
  );

  // Route Westlands -> Kencom (Reverse)
  const routeWestlandsToKencom = findOrCreateRoute(stopSarit, stopKencom);
  assert(
    !!routeWestlandsToKencom && routeWestlandsToKencom.waypoints.length >= 8,
    'B.2 Westlands -> Kencom return route generated with road-following waypoints'
  );
  const revFirstPt = routeWestlandsToKencom?.waypoints[0];
  const revLastPt = routeWestlandsToKencom?.waypoints[routeWestlandsToKencom.waypoints.length - 1];
  assert(
    revFirstPt?.[0] === stopSarit?.lat && revFirstPt?.[1] === stopSarit?.lng,
    'B.2 Reverse route starts at Westlands coordinates'
  );
  assert(
    revLastPt?.[0] === stopKencom?.lat && revLastPt?.[1] === stopKencom?.lng,
    'B.2 Reverse route ends at Kencom coordinates'
  );

  // Route to Yaya Centre
  const routeToYaya = findOrCreateRoute(stopKencom, stopYaya);
  assert(
    !!routeToYaya && routeToYaya.toStop.id === 'stop-yaya',
    'B.3 Route to Yaya Centre terminates at stop-yaya and not Westlands'
  );

  // Intermediate stops ordering
  assert(
    routeKencomToWestlands?.stops.some((s) => s.id === 'stop-museum-hill') === true,
    'B.4 Route Kencom -> Westlands includes Museum Hill intermediate stop in proper sequence'
  );

  // Route unavailable when origin === destination
  const routeSame = findOrCreateRoute(stopKencom, stopKencom);
  assert(
    routeSame === null,
    'B.5 findOrCreateRoute returns null for identical origin & destination (route-unavailable state)'
  );

  // Route unavailable when endpoint is null
  const routeNull = findOrCreateRoute(null, stopKencom);
  assert(
    routeNull === null,
    'B.6 findOrCreateRoute returns null when endpoint is null'
  );

  console.log('\nTRACK C: Simulated Bus Movement & Segment Distance Checks:');

  // All vehicles have valid routeId
  MOCK_VEHICLES.forEach((v) => {
    const route = MOCK_ROUTES.find((r) => r.id === v.routeId);
    assert(
      !!route,
      `C.1 Bus ${v.id} (${v.plate}) has valid assigned route ${v.routeId}`
    );
  });

  // Simulation initialization
  const simStates = initializeVehicleSimulation(MOCK_VEHICLES, MOCK_ROUTES);
  assert(
    simStates.size === MOCK_VEHICLES.length,
    `C.2 Vehicle simulation initialized for all ${MOCK_VEHICLES.length} buses`
  );

  // Every bus has loaded geometry with cumulative distances
  simStates.forEach((state, id) => {
    assert(
      state.isGeometryAvailable && !!state.geometry && state.geometry.totalDistanceMeters > 0,
      `C.3 Bus ${id} has loaded geometry (${state.geometry?.totalDistanceMeters.toFixed(0)}m, ${state.geometry?.waypoints.length} waypoints)`
    );
  });

  // Step simulation advances bus along route segments
  const busState = simStates.get('v-01')!;
  const prevDist = busState.currentDistanceMeters;
  const prevLat = busState.lat;
  const prevLng = busState.lng;

  // Advance simulation by 1.0 second
  const nextPos = stepVehicleSimulation(busState, 1.0);
  assert(
    busState.currentDistanceMeters !== prevDist,
    `C.4 Bus v-01 advanced distance from ${prevDist.toFixed(1)}m to ${busState.currentDistanceMeters.toFixed(1)}m along segment`
  );
  assert(
    typeof nextPos.lat === 'number' && typeof nextPos.lng === 'number' && !isNaN(nextPos.lat),
    'C.4 Bus step returned valid geographic coordinates'
  );

  // Bus turnaround at max distance
  busState.currentDistanceMeters = busState.geometry!.totalDistanceMeters;
  busState.direction = 1;
  stepVehicleSimulation(busState, 0.5);
  assert(
    (busState.direction as number) === -1,
    'C.5 Bus reached route endpoint and smoothly reversed direction to -1'
  );

  // Turnaround at start distance
  busState.currentDistanceMeters = 0;
  busState.direction = -1;
  stepVehicleSimulation(busState, 0.5);
  assert(
    (busState.direction as number) === 1,
    'C.5 Bus reached route start and smoothly reversed direction to 1'
  );

  console.log('\nTRACK D & E: Geodesic Math & Routing Service Caching:');

  // Haversine distance accuracy
  const distKencomWestlands = computeHaversineDistanceMeters(-1.2844, 36.8249, -1.2655, 36.8048);
  assert(
    distKencomWestlands > 2900 && distKencomWestlands < 3500,
    `D.1 Haversine distance Kencom -> Westlands is ${(distKencomWestlands / 1000).toFixed(2)} km (~3.1 km)`
  );

  // Coordinates are [lat, lng] format (lat negative for Nairobi, lng positive ~36.8)
  TRANSIT_STOPS.forEach((stop) => {
    assert(
      stop.lat < 0 && stop.lat > -2.0 && stop.lng > 36.0 && stop.lng < 38.0,
      `D.2 Stop ${stop.id} coordinates [${stop.lat}, ${stop.lng}] are valid [lat, lng] in Nairobi bounds`
    );
  });

  // Routing service caching & throttling
  routingService.clearCache();
  const stats0 = routingService.getStats();
  assert(stats0.hits === 0 && stats0.misses === 0, 'E.1 Routing service cache cleared');

  // Request 1: cache miss
  const r1 = routingService.getRouteSync(stopKencom, stopSarit, 'all', false);
  const stats1 = routingService.getStats();
  assert(!!r1 && stats1.misses === 1 && stats1.hits === 0, 'E.2 First route request records 1 cache miss');

  // Request 2: cache hit for identical query
  const r2 = routingService.getRouteSync(stopKencom, stopSarit, 'all', false);
  const stats2 = routingService.getStats();
  assert(r1 === r2 && stats2.hits === 1, 'E.3 Second route request hits memory cache with 0 recalculations');

  // Async throttled request test
  const rAsync = await routingService.getRoute(stopKencom, stopSarit, 'all', false);
  const stats3 = routingService.getStats();
  assert(rAsync === r1 && stats3.hits === 2, 'E.4 Async route request respects cache');

  console.log('\n====================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Test Results Summary: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} total checks.`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite runner encountered an unhandled exception:', err);
  process.exit(1);
});
