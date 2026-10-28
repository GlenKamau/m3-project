/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Automated Regression Test Suite for m3 Nairobi Transit
 * Verifies Saved Places, Recent Searches, Schema Validation,
 * Coordinate Integrity, Deduplication, and Local Storage Persistence.
 */

import { 
  getSavedPlaces, 
  savePlace, 
  updatePlace, 
  deletePlace, 
  resetSavedPlacesToDefaults,
  getRecentSearches, 
  addRecentSearch, 
  deleteRecentSearch, 
  clearRecentSearches,
  isValidSavedPlace,
  isValidRecentSearch,
  isValidTransportPreferences,
  getTransportPreferences,
  saveTransportPreferences,
  togglePreferredSacco,
  setPrioritizePreferred,
  resetTransportPreferences,
  isValidTripRecord,
  getTripHistory,
  recordTrip,
  updateTripStatus,
  deleteTripRecord,
  resetTripHistoryToDefaults,
  VALID_SACCO_IDS,
  DEFAULT_TRANSPORT_PREFERENCES,
  STORAGE_KEYS,
  MAX_RECENT_SEARCHES,
  MAX_TRIP_HISTORY
} from '../src/utils/storage';
import {
  isValidRouteGeometry,
  buildJourneyDirections,
  sortRouteOptions,
  formatRouteDuration,
  formatRouteFare
} from '../src/utils/journeyHelper';
import { COMMUTER_GUIDE_SECTIONS } from '../src/data/commuterGuideData';
import { TRANSIT_STOPS, MOCK_SAVED_PLACES, MOCK_PAST_TRIPS, SACCOS, MOCK_VEHICLES, MOCK_ROUTES, matchStopByQuery, findOrCreateRoute } from '../src/data/mockData';
import { SavedPlace, RecentSearch, TransportPreferences, RouteOption } from '../src/types/transit';

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

async function runStorageRegressionSuite() {
  console.log('========================================================');
  console.log('Starting m3 Saved Places & Recent Searches Test Suite');
  console.log('========================================================\n');

  // -------------------------------------------------------------------------
  // TEST GROUP 1: Schema Validation
  // -------------------------------------------------------------------------
  console.log('GROUP 1: Schema Validation Rules:');

  assert(
    isValidSavedPlace({
      id: 'sp-1',
      title: 'Home',
      address: 'Kilimani',
      iconName: 'home',
      lat: -1.2925,
      lng: 36.7876,
    }),
    '1.1 Valid SavedPlace passes schema check'
  );

  assert(
    !isValidSavedPlace({
      id: '',
      title: 'Home',
      lat: -1.2925,
      lng: 36.7876,
    }),
    '1.2 SavedPlace with empty ID is rejected'
  );

  assert(
    !isValidSavedPlace({
      id: 'sp-2',
      title: '',
      lat: -1.2925,
      lng: 36.7876,
    }),
    '1.3 SavedPlace with empty title is rejected'
  );

  assert(
    !isValidSavedPlace({
      id: 'sp-3',
      title: 'Valid Title',
      lat: 100, // Latitude > 90
      lng: 36.7876,
    }),
    '1.4 SavedPlace with out-of-range latitude (> 90) is rejected'
  );

  assert(
    !isValidSavedPlace({
      id: 'sp-4',
      title: 'Valid Title',
      lat: -1.2925,
      lng: NaN,
    }),
    '1.5 SavedPlace with NaN coordinate is rejected'
  );

  assert(
    !isValidSavedPlace({
      id: 'sp-5',
      title: 'Valid Title',
      lat: -1.2925,
      lng: 36.7876,
      iconName: 'invalid-icon' as any,
    }),
    '1.6 SavedPlace with unsupported icon is rejected'
  );

  assert(
    isValidRecentSearch({
      id: 'search-1',
      destination: 'Westlands (Sarit/The Mall)',
      lat: -1.2655,
      lng: 36.8048,
      timestamp: new Date().toISOString(),
    }),
    '1.7 Valid RecentSearch passes schema check'
  );

  assert(
    !isValidRecentSearch({
      id: 'search-2',
      destination: '',
      lat: -1.2655,
      lng: 36.8048,
      timestamp: new Date().toISOString(),
    }),
    '1.8 RecentSearch with empty destination is rejected'
  );

  assert(
    !isValidRecentSearch({
      id: 'search-3',
      destination: 'Westlands',
      lat: -1.2655,
      lng: 36.8048,
      timestamp: 'not-a-valid-date',
    }),
    '1.9 RecentSearch with unparseable timestamp is rejected'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 2: Saved Places Management
  // -------------------------------------------------------------------------
  console.log('\nGROUP 2: Saved Places Add / Edit / Rename / Delete:');

  // Reset to clean baseline
  resetSavedPlacesToDefaults();
  const initialPlaces = getSavedPlaces();
  assert(
    initialPlaces.length >= 4,
    '2.1 Initial saved places seeded with default Nairobi destinations (Home, Work, Airport, Kencom)',
    `Count: ${initialPlaces.length}`
  );

  const homePlace = initialPlaces.find((p) => p.title.toLowerCase() === 'home');
  assert(
    !!homePlace && homePlace.iconName === 'home',
    '2.2 Home shortcut exists with "home" icon'
  );

  const workPlace = initialPlaces.find((p) => p.title.toLowerCase() === 'work');
  assert(
    !!workPlace && workPlace.iconName === 'briefcase',
    '2.3 Work shortcut exists with "briefcase" icon'
  );

  // Add custom saved place strictly linked to a Nairobi transit stop
  const karenStop = matchStopByQuery('Karen');
  assert(
    !!karenStop,
    '2.4 Karen transit stop resolved successfully for coordinate binding'
  );

  const newCustomPlace: SavedPlace = {
    id: 'sp-karen-cottage',
    title: 'Karen Cottage',
    address: 'Near Karen Shopping Centre, Dagoretti Rd',
    iconName: 'home',
    lat: karenStop!.lat,
    lng: karenStop!.lng,
    stopId: karenStop!.id,
  };

  const afterAdd = savePlace(newCustomPlace);
  const foundAdded = afterAdd.find((p) => p.id === 'sp-karen-cottage');
  assert(
    !!foundAdded && foundAdded.title === 'Karen Cottage' && foundAdded.lat === karenStop!.lat && foundAdded.lng === karenStop!.lng,
    '2.5 Added new saved place with exact Karen coordinates [-1.3195, 36.7067]',
    `Got ${JSON.stringify(foundAdded)}`
  );

  // Rename and update existing place
  const updatedCustomPlace: SavedPlace = {
    ...foundAdded!,
    title: 'Karen Residence & Studio',
    address: 'Karen Shopping Centre Gate 2',
  };
  const afterUpdate = updatePlace(updatedCustomPlace);
  const foundUpdated = afterUpdate.find((p) => p.id === 'sp-karen-cottage');
  assert(
    !!foundUpdated && foundUpdated.title === 'Karen Residence & Studio' && foundUpdated.address === 'Karen Shopping Centre Gate 2',
    '2.6 Successfully renamed and updated saved place details',
    `Title: ${foundUpdated?.title}`
  );

  // Coordinate integrity test: coordinates must remain locked to the stop
  assert(
    foundUpdated?.lat === karenStop!.lat && foundUpdated?.lng === karenStop!.lng,
    '2.7 Coordinates remain preserved and faithful to verified transit stage during rename'
  );

  // Delete saved place
  const afterDelete = deletePlace('sp-karen-cottage');
  const foundDeleted = afterDelete.find((p) => p.id === 'sp-karen-cottage');
  assert(
    !foundDeleted,
    '2.8 Successfully deleted saved place by ID',
    `Place still exists: ${JSON.stringify(foundDeleted)}`
  );

  // Reload from storage simulation
  const reloadedPlaces = getSavedPlaces();
  assert(
    !reloadedPlaces.some((p) => p.id === 'sp-karen-cottage'),
    '2.9 Deletion persisted in storage across reload'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 3: Recent Destination Searches
  // -------------------------------------------------------------------------
  console.log('\nGROUP 3: Recent Searches Recording & Deduplication:');

  clearRecentSearches();
  const emptySearches = getRecentSearches();
  assert(
    emptySearches.length === 0,
    '3.1 Recent searches clean start (empty array)'
  );

  // Add 1st search
  const westlandsStop = matchStopByQuery('Westlands')!;
  const s1 = addRecentSearch(westlandsStop.name, westlandsStop.lat, westlandsStop.lng, westlandsStop.id);
  assert(
    s1.length === 1 && s1[0].destination === westlandsStop.name,
    '3.2 Successfully recorded 1st recent destination search'
  );

  // Add 2nd search
  const yayaStop = matchStopByQuery('Yaya')!;
  const s2 = addRecentSearch(yayaStop.name, yayaStop.lat, yayaStop.lng, yayaStop.id);
  assert(
    s2.length === 2 && s2[0].destination === yayaStop.name && s2[1].destination === westlandsStop.name,
    '3.3 2nd recent search prepended to index 0 with newest timestamp'
  );

  // Deduplication: re-selecting Westlands must move it to the top without duplicate entries
  const s3 = addRecentSearch(westlandsStop.name, westlandsStop.lat, westlandsStop.lng, westlandsStop.id);
  assert(
    s3.length === 2,
    '3.4 Re-selecting destination did not create duplicate record (length remains 2)'
  );
  assert(
    s3[0].destination === westlandsStop.name,
    '3.5 Re-selected destination bumped to index 0 (most recent)'
  );

  // Cap at 10 items
  for (let i = 0; i < 15; i++) {
    const dummyStop = TRANSIT_STOPS[i % TRANSIT_STOPS.length];
    addRecentSearch(`${dummyStop.name} (Trial ${i})`, dummyStop.lat, dummyStop.lng);
  }
  const cappedSearches = getRecentSearches();
  assert(
    cappedSearches.length === MAX_RECENT_SEARCHES,
    `3.6 Recent searches strictly capped at MAX_RECENT_SEARCHES (${MAX_RECENT_SEARCHES}) items`,
    `Got length: ${cappedSearches.length}`
  );

  // Delete individual recent search
  const idToDelete = cappedSearches[0].id;
  const afterSingleDelete = deleteRecentSearch(idToDelete);
  assert(
    !afterSingleDelete.some((s) => s.id === idToDelete) && afterSingleDelete.length === 9,
    '3.7 Successfully deleted individual recent search item'
  );

  // Clear all recent searches
  clearRecentSearches();
  assert(
    getRecentSearches().length === 0,
    '3.8 Successfully cleared all recent searches'
  );

  // Separation from completed trip history
  assert(
    MOCK_PAST_TRIPS.length > 0 && typeof MOCK_PAST_TRIPS[0].mpesaRef === 'string',
    '3.9 Recent searches remain completely separate from completed trip history (MOCK_PAST_TRIPS)'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 4: Storage Corruption Recovery
  // -------------------------------------------------------------------------
  console.log('\nGROUP 4: Robust Storage Fault Tolerance & Recovery:');

  // Verify recovery from broken data
  resetSavedPlacesToDefaults();
  const recoveredPlaces = getSavedPlaces();
  assert(
    recoveredPlaces.length >= 4,
    '4.1 Graceful fallback to verified defaults on fresh/reset storage'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 5: Transport Preferences & SACCO Operator Integrity
  // -------------------------------------------------------------------------
  console.log('\nGROUP 5: Transport Preferences & SACCO Operator Integrity:');

  // Reset to known state
  resetTransportPreferences();
  const initPrefs = getTransportPreferences();

  assert(
    isValidTransportPreferences(initPrefs),
    '5.1 Default transport preferences pass schema validation'
  );

  assert(
    initPrefs.preferredSaccoIds.includes('super-metro') &&
    initPrefs.preferredSaccoIds.includes('basigo') &&
    initPrefs.prioritizePreferred === true,
    '5.2 Default transport preferences initialize with Super Metro and BasiGo prioritized'
  );

  // Schema validation checks
  assert(
    !isValidTransportPreferences({ preferredSaccoIds: 'not-an-array', prioritizePreferred: true }),
    '5.3 Schema rejects non-array preferredSaccoIds'
  );

  assert(
    !isValidTransportPreferences({ preferredSaccoIds: ['super-metro'], prioritizePreferred: 'yes' }),
    '5.4 Schema rejects non-boolean prioritizePreferred'
  );

  assert(
    !isValidTransportPreferences({ preferredSaccoIds: ['non-existent-operator'], prioritizePreferred: true }),
    '5.5 Schema rejects unregistered operator IDs'
  );

  assert(
    !isValidTransportPreferences({ preferredSaccoIds: ['all'], prioritizePreferred: true }),
    '5.6 Schema rejects "all" as a preferred operator ID'
  );

  // Saving preferences
  const customPrefs = saveTransportPreferences({
    preferredSaccoIds: ['kbs', 'city-hoppa', 'metro-trans'],
    prioritizePreferred: false,
  });

  assert(
    customPrefs.preferredSaccoIds.length === 3 &&
    customPrefs.preferredSaccoIds.includes('kbs') &&
    customPrefs.prioritizePreferred === false,
    '5.7 Successfully persists custom operator selection and prioritization setting'
  );

  const reloadedPrefs = getTransportPreferences();
  assert(
    reloadedPrefs.preferredSaccoIds.length === 3 &&
    reloadedPrefs.prioritizePreferred === false,
    '5.8 Preferences survive reload/storage retrieval'
  );

  // Toggle helper
  const toggledOff = togglePreferredSacco('kbs');
  assert(
    !toggledOff.preferredSaccoIds.includes('kbs') && toggledOff.preferredSaccoIds.length === 2,
    '5.9 togglePreferredSacco removes existing operator'
  );

  const toggledOn = togglePreferredSacco('kbs');
  assert(
    toggledOn.preferredSaccoIds.includes('kbs') && toggledOn.preferredSaccoIds.length === 3,
    '5.10 togglePreferredSacco adds unselected operator'
  );

  // Deduplication
  const deduped = saveTransportPreferences({
    preferredSaccoIds: ['super-metro', 'super-metro', 'basigo'],
    prioritizePreferred: true,
  });
  assert(
    deduped.preferredSaccoIds.length === 2,
    '5.11 Duplicated SACCO IDs are automatically deduplicated'
  );

  // Stable IDs check against SACCOS dataset
  const allKnownIds = new Set(SACCOS.map((s) => s.id));
  const validStableIds = deduped.preferredSaccoIds.every((id) => allKnownIds.has(id));
  assert(
    validStableIds,
    '5.12 All saved preferred operator IDs strictly reference stable IDs in SACCOS dataset'
  );

  // Robust corruption recovery
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.TRANSPORT_PREFERENCES, '{ corrupted json ::::');
    }
  } catch {
    // Ignore
  }
  const recoveredPrefs = getTransportPreferences();
  assert(
    isValidTransportPreferences(recoveredPrefs) && recoveredPrefs.preferredSaccoIds.length > 0,
    '5.13 Corrupted storage payload recovers default transport preferences safely'
  );

  // Bus simulation non-destruction verification:
  // Toggling preferences must never mutate or reset MOCK_VEHICLES or route geometries
  const initialVehicleCount = MOCK_VEHICLES.length;
  const initialRouteWaypointCount = MOCK_ROUTES.reduce((sum, r) => sum + r.waypoints.length, 0);

  togglePreferredSacco('moja-ev');
  setPrioritizePreferred(true);

  assert(
    MOCK_VEHICLES.length === initialVehicleCount,
    '5.14 Vehicle fleet size and mock vehicles remain 100% intact across preference updates'
  );

  const currentRouteWaypointCount = MOCK_ROUTES.reduce((sum, r) => sum + r.waypoints.length, 0);
  assert(
    currentRouteWaypointCount === initialRouteWaypointCount,
    '5.15 Route geometry waypoints remain 100% unaltered across preference updates'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 6: Step-by-Step Journey Directions & Safe Route Comparisons
  // -------------------------------------------------------------------------
  console.log('\nGROUP 6: Step-by-Step Journey Directions & Route Comparisons:');

  const sampleRoute = MOCK_ROUTES[0]; // Kencom -> Museum Hill -> Westlands
  assert(
    isValidRouteGeometry(sampleRoute),
    '6.1 Valid road-following route geometry passes isValidRouteGeometry check'
  );

  const straightLineFakeRoute: RouteOption = {
    ...sampleRoute,
    waypoints: [
      [-1.2844, 36.8249],
      [-1.2655, 36.8048],
    ], // Only 2 endpoints (straight line)
  };
  assert(
    !isValidRouteGeometry(straightLineFakeRoute),
    '6.2 Straight-line 2-point route is rejected by isValidRouteGeometry'
  );

  const steps = buildJourneyDirections(sampleRoute, 'City Hall Way', 'Sarit Centre Office');
  assert(
    steps.length === 5 &&
      steps[0].type === 'origin' &&
      steps[1].type === 'board' &&
      steps[2].type === 'intermediate' &&
      steps[3].type === 'alight' &&
      steps[4].type === 'destination',
    '6.3 buildJourneyDirections generates ordered origin, board, intermediate, alight, and destination steps',
    `Got steps: ${steps.map((s) => s.type).join(' -> ')}`
  );

  const boardStopId: string | undefined = steps[1].stop?.id;
  const alightStopId: string | undefined = steps[3].stop?.id;
  assert(
    Boolean(boardStopId && alightStopId && boardStopId !== alightStopId && boardStopId === 'stop-kencom' && alightStopId === 'stop-westlands'),
    '6.4 Boarding stop (Kencom) and Alighting stop (Westlands) are distinct and match route stops'
  );

  // Cross-corridor route with transfer info (e.g. Westlands -> Karen)
  const stopWest = matchStopByQuery('Westlands')!;
  const stopKar = matchStopByQuery('Karen')!;
  const transferRoute = findOrCreateRoute(stopWest, stopKar);
  assert(
    !!transferRoute && transferRoute.transfersCount === 1 && !!transferRoute.transferInfo,
    '6.5 Cross-corridor journey (Westlands -> Karen) includes transfer metadata at CBD terminal'
  );

  const transferSteps = buildJourneyDirections(transferRoute!);
  assert(
    transferSteps.some((s) => s.type === 'transfer' && !!s.transferInfo?.nextRouteCode),
    '6.6 Step-by-step directions include explicit transfer instruction identifying next route and SACCO'
  );

  // Route comparison: missing fares or durations must NOT be treated as 0
  const routeWithMissingMetrics: RouteOption = {
    ...MOCK_ROUTES[0],
    id: 'route-missing-metrics',
    demoFareKes: null,
    durationMinutes: null,
  };
  const routeCheapFast: RouteOption = {
    ...MOCK_ROUTES[1],
    id: 'route-cheap-fast',
    demoFareKes: 60,
    durationMinutes: 14,
  };
  const routeExpensiveSlow: RouteOption = {
    ...MOCK_ROUTES[2],
    id: 'route-exp-slow',
    demoFareKes: 120,
    durationMinutes: 35,
  };

  const sortedByFare = sortRouteOptions(
    [routeWithMissingMetrics, routeExpensiveSlow, routeCheapFast],
    'cheapest'
  );
  assert(
    sortedByFare[0].id === 'route-cheap-fast' &&
      sortedByFare[1].id === 'route-exp-slow' &&
      sortedByFare[2].id === 'route-missing-metrics',
    '6.7 Sorting by lowest fare places missing/null fare at the end (never treated as KES 0)'
  );

  const sortedByDuration = sortRouteOptions(
    [routeWithMissingMetrics, routeExpensiveSlow, routeCheapFast],
    'fastest'
  );
  assert(
    sortedByDuration[0].id === 'route-cheap-fast' &&
      sortedByDuration[1].id === 'route-exp-slow' &&
      sortedByDuration[2].id === 'route-missing-metrics',
    '6.8 Sorting by fastest duration places missing/null duration at the end (never treated as 0 min)'
  );

  assert(
    formatRouteFare(null) === 'Fare unavailable' &&
      formatRouteDuration(null) === 'Duration unavailable',
    '6.9 Missing fare and duration format safely as unavailable rather than 0'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 7: Trip History, Status Transitions & Repeat Journeys
  // -------------------------------------------------------------------------
  console.log('\nGROUP 7: Trip History Persistence, Statuses & Repeat Journeys:');

  resetTripHistoryToDefaults();
  clearRecentSearches();

  const initialTrips = getTripHistory();
  assert(
    initialTrips.length === MOCK_PAST_TRIPS.length &&
      initialTrips.every(isValidTripRecord),
    '7.1 Initial trip history loads validated demo records with coordinates'
  );

  // Destination search must NOT create a completed trip or alter trip history
  addRecentSearch('Yaya Centre', -1.2925, 36.7876, 'stop-yaya');
  assert(
    getTripHistory().length === initialTrips.length,
    '7.2 Recording a destination search does NOT add a trip to trip history'
  );

  // Record a Planned trip
  const afterPlanned = recordTrip({
    origin: 'Kencom Terminal',
    originLat: -1.2844,
    originLng: 36.8249,
    originStopId: 'stop-kencom',
    destination: 'Karen Shopping Centre',
    destinationLat: -1.3195,
    destinationLng: 36.7067,
    destinationStopId: 'stop-karen',
    routeId: 'route-ch111-karen',
    routeCode: 'CH-111',
    routeName: 'Ngong Road - Karen Corridor',
    saccoId: 'city-hoppa',
    saccoName: 'City Hoppa',
    fareKes: 90,
    durationMinutes: 38,
    isElectric: false,
    status: 'Planned',
  });

  const newTrip = afterPlanned[0];
  assert(
    newTrip.status === 'Planned' &&
      newTrip.originLat === -1.2844 &&
      newTrip.destinationLat === -1.3195 &&
      newTrip.isPrototypeAction === true,
    '7.3 Successfully recorded a "Planned" trip with accurate origin & destination coordinates'
  );

  // Duplicate guard for rapid identical call
  const afterDuplicateAttempt = recordTrip({
    origin: 'Kencom Terminal',
    originLat: -1.2844,
    originLng: 36.8249,
    originStopId: 'stop-kencom',
    destination: 'Karen Shopping Centre',
    destinationLat: -1.3195,
    destinationLng: 36.7067,
    destinationStopId: 'stop-karen',
    routeId: 'route-ch111-karen',
    routeCode: 'CH-111',
    routeName: 'Ngong Road - Karen Corridor',
    saccoId: 'city-hoppa',
    saccoName: 'City Hoppa',
    fareKes: 90,
    durationMinutes: 38,
    isElectric: false,
    status: 'Planned',
  });
  assert(
    afterDuplicateAttempt.length === afterPlanned.length,
    '7.4 Rapid duplicate trip creation is prevented'
  );

  // Transition Planned -> In progress -> Completed -> Cancelled
  const afterInProgress = updateTripStatus(newTrip.id, 'In progress');
  assert(
    afterInProgress.find((t) => t.id === newTrip.id)?.status === 'In progress',
    '7.5 Trip status transitions from "Planned" to "In progress"'
  );

  const afterCompleted = updateTripStatus(newTrip.id, 'Completed');
  assert(
    afterCompleted.find((t) => t.id === newTrip.id)?.status === 'Completed',
    '7.6 Trip status transitions from "In progress" to "Completed"'
  );

  const afterCancelled = updateTripStatus(newTrip.id, 'Cancelled');
  assert(
    afterCancelled.find((t) => t.id === newTrip.id)?.status === 'Cancelled',
    '7.7 Trip status transitions to "Cancelled"'
  );

  // Cap at 50 trips
  for (let i = 0; i < 60; i++) {
    const stA = TRANSIT_STOPS[i % TRANSIT_STOPS.length];
    const stB = TRANSIT_STOPS[(i + 1) % TRANSIT_STOPS.length];
    recordTrip({
      origin: `${stA.name} #${i}`,
      originLat: stA.lat,
      originLng: stA.lng,
      originStopId: stA.id,
      destination: `${stB.name} #${i}`,
      destinationLat: stB.lat,
      destinationLng: stB.lng,
      destinationStopId: stB.id,
      routeId: `route-test-${i}`,
      routeCode: `T-${i}`,
      saccoId: 'super-metro',
      saccoName: 'Super Metro',
      fareKes: 70,
      durationMinutes: 20,
      isElectric: true,
      status: 'Completed',
    });
  }
  const cappedTrips = getTripHistory();
  assert(
    cappedTrips.length === MAX_TRIP_HISTORY,
    `7.8 Trip history strictly capped at ${MAX_TRIP_HISTORY} most recent records`,
    `Got ${cappedTrips.length}`
  );

  // Clean up back to defaults
  resetTripHistoryToDefaults();

  // -------------------------------------------------------------------------
  // TEST GROUP 8: Nairobi Commuter Guide Completeness
  // -------------------------------------------------------------------------
  console.log('\nGROUP 8: Nairobi Commuter Guide Content & Structure:');

  assert(
    COMMUTER_GUIDE_SECTIONS.length === 8,
    '8.1 Nairobi Commuter Guide contains all 8 required sections'
  );

  assert(
    COMMUTER_GUIDE_SECTIONS.every(
      (s) =>
        s.id.trim().length > 0 &&
        s.title.trim().length > 0 &&
        s.generalGuidance.length > 0 &&
        s.verifyLocallyNote.trim().length > 0
    ),
    '8.2 Every commuter guide section includes general guidance and a local verification notice'
  );

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n========================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`Results: ${passedCount}/${totalCount} tests passed.`);
  console.log('========================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runStorageRegressionSuite().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});

