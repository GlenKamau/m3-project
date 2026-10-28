/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Typed Storage Utilities for m3 Nairobi Transit
 * Provides robust localStorage persistence with schema validation,
 * corruption recovery, deduplication, and cross-component updates.
 */

import { SavedPlace, RecentSearch, TransportPreferences, PastTrip, TripStatus } from '../types/transit';
import { MOCK_SAVED_PLACES, MOCK_PAST_TRIPS, SACCOS } from '../data/mockData';

export const STORAGE_KEYS = {
  SAVED_PLACES: 'm3_saved_places',
  RECENT_SEARCHES: 'm3_recent_searches',
  TRANSPORT_PREFERENCES: 'm3_transport_preferences',
  TRIP_HISTORY: 'm3_trip_history',
} as const;

export const STORAGE_EVENT = 'm3_storage_update';

// In-memory fallback for environments where localStorage is unavailable (SSR, tests, or disabled cookies)
const memoryStorage: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__m3_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getItem(key: string): string | null {
  if (isLocalStorageAvailable()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorage[key] ?? null;
    }
  }
  return memoryStorage[key] ?? null;
}

function setItem(key: string, value: string, notify: boolean = true): void {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStorage[key] = value;
    }
  } else {
    memoryStorage[key] = value;
  }

  // Notify active components in the current window only on explicit mutations (not read-time seeding)
  if (notify && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
    } catch {
      // Ignore in non-DOM test environments
    }
  }
}

function removeItem(key: string, notify: boolean = true): void {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      delete memoryStorage[key];
    }
  } else {
    delete memoryStorage[key];
  }

  if (notify && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
    } catch {
      // Ignore in non-DOM test environments
    }
  }
}

// ---------------------------------------------------------------------------
// Schema Validators
// ---------------------------------------------------------------------------

const ALLOWED_ICONS = new Set(['home', 'briefcase', 'plane', 'map-pin', 'shopping-bag']);

export function isValidSavedPlace(item: unknown): item is SavedPlace {
  if (!item || typeof item !== 'object') return false;
  const p = item as Record<string, unknown>;

  if (typeof p.id !== 'string' || !p.id.trim()) return false;
  if (typeof p.title !== 'string' || !p.title.trim()) return false;
  if (typeof p.lat !== 'number' || isNaN(p.lat) || p.lat < -90 || p.lat > 90) return false;
  if (typeof p.lng !== 'number' || isNaN(p.lng) || p.lng < -180 || p.lng > 180) return false;

  if (p.iconName && !ALLOWED_ICONS.has(String(p.iconName))) {
    return false;
  }

  return true;
}

export function isValidRecentSearch(item: unknown): item is RecentSearch {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;

  if (typeof r.id !== 'string' || !r.id.trim()) return false;
  if (typeof r.destination !== 'string' || !r.destination.trim()) return false;
  if (typeof r.lat !== 'number' || isNaN(r.lat) || r.lat < -90 || r.lat > 90) return false;
  if (typeof r.lng !== 'number' || isNaN(r.lng) || r.lng < -180 || r.lng > 180) return false;
  if (typeof r.timestamp !== 'string' || isNaN(Date.parse(r.timestamp))) return false;

  return true;
}

export const VALID_SACCO_IDS = new Set(SACCOS.filter((s) => s.id !== 'all').map((s) => s.id));

export const VALID_TRIP_STATUSES = new Set<TripStatus>([
  'Planned',
  'In progress',
  'Completed',
  'Cancelled',
]);

export function isValidTransportPreferences(item: unknown): item is TransportPreferences {
  if (!item || typeof item !== 'object') return false;
  const p = item as Record<string, unknown>;

  if (!Array.isArray(p.preferredSaccoIds)) return false;
  if (typeof p.prioritizePreferred !== 'boolean') return false;

  for (const id of p.preferredSaccoIds) {
    if (typeof id !== 'string' || !VALID_SACCO_IDS.has(id)) {
      return false;
    }
  }

  return true;
}

export function isValidTripRecord(item: unknown): item is PastTrip {
  if (!item || typeof item !== 'object') return false;
  const t = item as Record<string, unknown>;

  if (typeof t.id !== 'string' || !t.id.trim()) return false;
  if (typeof t.origin !== 'string' || !t.origin.trim()) return false;
  if (typeof t.destination !== 'string' || !t.destination.trim()) return false;
  if (typeof t.originLat !== 'number' || isNaN(t.originLat) || t.originLat < -90 || t.originLat > 90) return false;
  if (typeof t.originLng !== 'number' || isNaN(t.originLng) || t.originLng < -180 || t.originLng > 180) return false;
  if (typeof t.destinationLat !== 'number' || isNaN(t.destinationLat) || t.destinationLat < -90 || t.destinationLat > 90) return false;
  if (typeof t.destinationLng !== 'number' || isNaN(t.destinationLng) || t.destinationLng < -180 || t.destinationLng > 180) return false;
  if (typeof t.routeId !== 'string' || !t.routeId.trim()) return false;
  if (typeof t.routeCode !== 'string' || !t.routeCode.trim()) return false;
  if (typeof t.saccoId !== 'string' || !t.saccoId.trim()) return false;
  if (typeof t.saccoName !== 'string' || !t.saccoName.trim()) return false;
  if (typeof t.timestamp !== 'string' || isNaN(Date.parse(t.timestamp))) return false;
  if (typeof t.status !== 'string' || !VALID_TRIP_STATUSES.has(t.status as TripStatus)) return false;

  if (t.fareKes !== null && t.fareKes !== undefined) {
    if (typeof t.fareKes !== 'number' || isNaN(t.fareKes) || t.fareKes < 0) return false;
  }
  if (t.durationMinutes !== null && t.durationMinutes !== undefined) {
    if (typeof t.durationMinutes !== 'number' || isNaN(t.durationMinutes) || t.durationMinutes < 0) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Saved Places API
// ---------------------------------------------------------------------------

/**
 * Retrieve all saved places from storage.
 * Falls back to MOCK_SAVED_PLACES if missing, unparseable, or corrupted.
 */
export function getSavedPlaces(): SavedPlace[] {
  const raw = getItem(STORAGE_KEYS.SAVED_PLACES);
  if (!raw) {
    // Seed storage with default mock saved places silently
    const defaults = [...MOCK_SAVED_PLACES];
    try {
      setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(defaults), false);
    } catch {
      // Ignore write failure
    }
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[m3 storage] Saved places payload is not an array. Resetting to defaults.');
      setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(MOCK_SAVED_PLACES), false);
      return [...MOCK_SAVED_PLACES];
    }

    const validPlaces = parsed.filter(isValidSavedPlace);
    if (validPlaces.length === 0) {
      console.warn('[m3 storage] No valid saved places found in array. Resetting to defaults.');
      setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(MOCK_SAVED_PLACES), false);
      return [...MOCK_SAVED_PLACES];
    }

    return validPlaces;
  } catch (err) {
    console.error('[m3 storage] Corrupted JSON in saved places storage. Recovering defaults.', err);
    setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(MOCK_SAVED_PLACES), false);
    return [...MOCK_SAVED_PLACES];
  }
}

/**
 * Save a new place or update an existing one immediately.
 */
export function savePlace(place: SavedPlace): SavedPlace[] {
  if (!isValidSavedPlace(place)) {
    throw new Error('Invalid SavedPlace schema provided.');
  }

  const places = getSavedPlaces();
  const existingIdx = places.findIndex((p) => p.id === place.id);

  let updated: SavedPlace[];
  if (existingIdx >= 0) {
    updated = [...places];
    updated[existingIdx] = { ...place };
  } else {
    updated = [...places, { ...place }];
  }

  setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(updated));
  return updated;
}

/**
 * Update an existing saved place.
 */
export function updatePlace(place: SavedPlace): SavedPlace[] {
  return savePlace(place);
}

/**
 * Delete a saved place by ID immediately.
 */
export function deletePlace(id: string): SavedPlace[] {
  const places = getSavedPlaces();
  const filtered = places.filter((p) => p.id !== id);
  setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(filtered));
  return filtered;
}

/**
 * Reset saved places to initial defaults.
 */
export function resetSavedPlacesToDefaults(): SavedPlace[] {
  const defaults = [...MOCK_SAVED_PLACES];
  setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(defaults));
  return defaults;
}

// ---------------------------------------------------------------------------
// Recent Searches API
// ---------------------------------------------------------------------------

export const MAX_RECENT_SEARCHES = 10;

/**
 * Retrieve recent searches.
 * Falls back to [] if missing or corrupted.
 */
export function getRecentSearches(): RecentSearch[] {
  const raw = getItem(STORAGE_KEYS.RECENT_SEARCHES);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[m3 storage] Recent searches payload is not an array. Resetting.');
      removeItem(STORAGE_KEYS.RECENT_SEARCHES, false);
      return [];
    }

    const validSearches = parsed.filter(isValidRecentSearch);
    // Sort descending by timestamp just in case
    validSearches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return validSearches.slice(0, MAX_RECENT_SEARCHES);
  } catch (err) {
    console.error('[m3 storage] Corrupted JSON in recent searches. Clearing.', err);
    removeItem(STORAGE_KEYS.RECENT_SEARCHES, false);
    return [];
  }
}

/**
 * Record a recent destination search.
 * Deduplicates by destination name and brings to the top.
 * Strictly limits list to MAX_RECENT_SEARCHES (10).
 */
export function addRecentSearch(
  destination: string,
  lat: number,
  lng: number,
  stopId?: string,
  saccoHint?: string
): RecentSearch[] {
  const cleanDest = destination.trim();
  if (!cleanDest || isNaN(lat) || isNaN(lng)) {
    return getRecentSearches();
  }

  const existing = getRecentSearches();

  // Deduplicate case-insensitively or by exact stopId/location
  const filtered = existing.filter(
    (item) =>
      item.destination.toLowerCase() !== cleanDest.toLowerCase() &&
      (!stopId || item.stopId !== stopId)
  );

  const newRecord: RecentSearch = {
    id: `search-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    destination: cleanDest,
    lat,
    lng,
    timestamp: new Date().toISOString(),
    stopId,
    saccoHint,
  };

  const updated = [newRecord, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  return updated;
}

/**
 * Remove a single recent search record by ID.
 */
export function deleteRecentSearch(id: string): RecentSearch[] {
  const current = getRecentSearches();
  const updated = current.filter((item) => item.id !== id);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  return updated;
}

/**
 * Clear all recent search history.
 */
export function clearRecentSearches(): void {
  removeItem(STORAGE_KEYS.RECENT_SEARCHES);
}

// ---------------------------------------------------------------------------
// Transport Preferences API (SACCO Preferences & Prioritization)
// ---------------------------------------------------------------------------

export const DEFAULT_TRANSPORT_PREFERENCES: TransportPreferences = {
  preferredSaccoIds: ['super-metro', 'basigo'],
  prioritizePreferred: true,
};

/**
 * Retrieve transport preferences from persistent storage.
 * Gracefully handles missing, malformed, or corrupted storage by recovering defaults.
 */
export function getTransportPreferences(): TransportPreferences {
  const raw = getItem(STORAGE_KEYS.TRANSPORT_PREFERENCES);
  if (!raw) {
    const defaults: TransportPreferences = {
      preferredSaccoIds: [...DEFAULT_TRANSPORT_PREFERENCES.preferredSaccoIds],
      prioritizePreferred: DEFAULT_TRANSPORT_PREFERENCES.prioritizePreferred,
    };
    try {
      setItem(STORAGE_KEYS.TRANSPORT_PREFERENCES, JSON.stringify(defaults), false);
    } catch {
      // Ignore write failure in test/isolated env
    }
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn('[m3 storage] Malformed transport preferences payload. Resetting to defaults.');
      const defaults = { ...DEFAULT_TRANSPORT_PREFERENCES, preferredSaccoIds: [...DEFAULT_TRANSPORT_PREFERENCES.preferredSaccoIds] };
      setItem(STORAGE_KEYS.TRANSPORT_PREFERENCES, JSON.stringify(defaults), false);
      return defaults;
    }

    // Sanitize and validate preferred SACCO IDs
    const rawIds = Array.isArray(parsed.preferredSaccoIds) ? parsed.preferredSaccoIds : [];
    const validIds: string[] = [];
    const seen = new Set<string>();

    for (const id of rawIds) {
      if (typeof id === 'string' && VALID_SACCO_IDS.has(id) && !seen.has(id)) {
        seen.add(id);
        validIds.push(id);
      }
    }

    const prioritize = typeof parsed.prioritizePreferred === 'boolean' 
      ? parsed.prioritizePreferred 
      : DEFAULT_TRANSPORT_PREFERENCES.prioritizePreferred;

    const sanitized: TransportPreferences = {
      preferredSaccoIds: validIds,
      prioritizePreferred: prioritize,
    };

    // If payload was partly malformed, re-persist sanitized version silently
    if (validIds.length !== rawIds.length || typeof parsed.prioritizePreferred !== 'boolean') {
      setItem(STORAGE_KEYS.TRANSPORT_PREFERENCES, JSON.stringify(sanitized), false);
    }

    return sanitized;
  } catch (err) {
    console.error('[m3 storage] Corrupted JSON in transport preferences. Resetting.', err);
    const defaults = { ...DEFAULT_TRANSPORT_PREFERENCES, preferredSaccoIds: [...DEFAULT_TRANSPORT_PREFERENCES.preferredSaccoIds] };
    setItem(STORAGE_KEYS.TRANSPORT_PREFERENCES, JSON.stringify(defaults), false);
    return defaults;
  }
}

/**
 * Persist transport preferences to storage.
 * Guarantees stable operator IDs and schema validity.
 */
export function saveTransportPreferences(prefs: TransportPreferences): TransportPreferences {
  const rawIds = Array.isArray(prefs?.preferredSaccoIds) ? prefs.preferredSaccoIds : [];
  const validIds: string[] = [];
  const seen = new Set<string>();

  for (const id of rawIds) {
    if (typeof id === 'string' && VALID_SACCO_IDS.has(id) && !seen.has(id)) {
      seen.add(id);
      validIds.push(id);
    }
  }

  const cleaned: TransportPreferences = {
    preferredSaccoIds: validIds,
    prioritizePreferred: Boolean(prefs?.prioritizePreferred),
  };

  setItem(STORAGE_KEYS.TRANSPORT_PREFERENCES, JSON.stringify(cleaned));
  return cleaned;
}

/**
 * Toggle a SACCO's preferred status.
 */
export function togglePreferredSacco(saccoId: string): TransportPreferences {
  if (!VALID_SACCO_IDS.has(saccoId)) {
    return getTransportPreferences();
  }

  const current = getTransportPreferences();
  const exists = current.preferredSaccoIds.includes(saccoId);
  const updatedIds = exists
    ? current.preferredSaccoIds.filter((id) => id !== saccoId)
    : [...current.preferredSaccoIds, saccoId];

  return saveTransportPreferences({
    ...current,
    preferredSaccoIds: updatedIds,
  });
}

/**
 * Set the prioritize preferred toggle.
 */
export function setPrioritizePreferred(prioritize: boolean): TransportPreferences {
  const current = getTransportPreferences();
  return saveTransportPreferences({
    ...current,
    prioritizePreferred: prioritize,
  });
}

/**
 * Reset transport preferences to defaults.
 */
export function resetTransportPreferences(): TransportPreferences {
  const defaults: TransportPreferences = {
    preferredSaccoIds: [...DEFAULT_TRANSPORT_PREFERENCES.preferredSaccoIds],
    prioritizePreferred: DEFAULT_TRANSPORT_PREFERENCES.prioritizePreferred,
  };
  setItem(STORAGE_KEYS.TRANSPORT_PREFERENCES, JSON.stringify(defaults));
  return defaults;
}

// ---------------------------------------------------------------------------
// Trip History API (Planned, In progress, Completed, Cancelled)
// Kept strictly separate from Recent Searches.
// ---------------------------------------------------------------------------

export const MAX_TRIP_HISTORY = 50;

export interface CreateTripInput {
  origin: string;
  originLat: number;
  originLng: number;
  originStopId?: string;
  destination: string;
  destinationLat: number;
  destinationLng: number;
  destinationStopId?: string;
  routeId: string;
  routeCode: string;
  routeName?: string;
  saccoId: string;
  saccoName: string;
  fareKes?: number | null;
  durationMinutes?: number | null;
  isElectric: boolean;
  status: TripStatus;
  mpesaRef?: string;
}

/**
 * Retrieve persisted trip history records.
 * Seeds with MOCK_PAST_TRIPS on first load and safely recovers from corrupted storage.
 * Enforces the 50-record limit.
 */
export function getTripHistory(): PastTrip[] {
  const raw = getItem(STORAGE_KEYS.TRIP_HISTORY);
  if (!raw) {
    const defaults = [...MOCK_PAST_TRIPS];
    try {
      setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(defaults), false);
    } catch {
      // Ignore write failure
    }
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[m3 storage] Trip history payload is not an array. Recovering defaults.');
      const defaults = [...MOCK_PAST_TRIPS];
      setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(defaults), false);
      return defaults;
    }

    const validTrips = parsed.filter(isValidTripRecord);
    if (validTrips.length === 0 && parsed.length > 0) {
      console.warn('[m3 storage] No valid trip records found in corrupted array. Recovering defaults.');
      const defaults = [...MOCK_PAST_TRIPS];
      setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(defaults), false);
      return defaults;
    }

    return validTrips.slice(0, MAX_TRIP_HISTORY);
  } catch (err) {
    console.error('[m3 storage] Corrupted JSON in trip history storage. Recovering defaults.', err);
    const defaults = [...MOCK_PAST_TRIPS];
    setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(defaults), false);
    return defaults;
  }
}

/**
 * Record a new trip (Planned, In progress, Completed, or Cancelled) in history.
 * Avoids duplicate records caused by rapid repeated event handlers and caps at 50 records.
 */
export function recordTrip(input: CreateTripInput): PastTrip[] {
  const existing = getTripHistory();
  const now = new Date();
  const nowMs = now.getTime();

  // Deduplicate rapid identical trip creations within 2.5 seconds
  const duplicateIndex = existing.findIndex((t) => {
    const tMs = Date.parse(t.timestamp);
    return (
      !isNaN(tMs) &&
      Math.abs(nowMs - tMs) < 2500 &&
      t.routeId === input.routeId &&
      t.origin.toLowerCase() === input.origin.trim().toLowerCase() &&
      t.destination.toLowerCase() === input.destination.trim().toLowerCase() &&
      t.status === input.status
    );
  });

  if (duplicateIndex === 0) {
    return existing;
  }

  const formattedDate = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const newTrip: PastTrip = {
    id: `trip-${nowMs}-${Math.random().toString(36).substring(2, 7)}`,
    origin: input.origin.trim(),
    originLat: input.originLat,
    originLng: input.originLng,
    originStopId: input.originStopId,
    destination: input.destination.trim(),
    destinationLat: input.destinationLat,
    destinationLng: input.destinationLng,
    destinationStopId: input.destinationStopId,
    routeId: input.routeId,
    routeCode: input.routeCode,
    routeName: input.routeName,
    saccoId: input.saccoId,
    saccoName: input.saccoName,
    timestamp: now.toISOString(),
    date: formattedDate,
    time: formattedTime,
    fareKes:
      typeof input.fareKes === 'number' && !isNaN(input.fareKes) ? input.fareKes : null,
    mpesaRef:
      input.mpesaRef || `DEMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    isElectric: Boolean(input.isElectric),
    durationMinutes:
      typeof input.durationMinutes === 'number' && !isNaN(input.durationMinutes)
        ? input.durationMinutes
        : null,
    status: VALID_TRIP_STATUSES.has(input.status) ? input.status : 'Planned',
    isPrototypeAction: true,
  };

  if (!isValidTripRecord(newTrip)) {
    throw new Error('Invalid trip record data provided.');
  }

  const updated = [newTrip, ...existing].slice(0, MAX_TRIP_HISTORY);
  setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(updated));
  return updated;
}

/**
 * Update the status of an existing trip record ('Planned' | 'In progress' | 'Completed' | 'Cancelled').
 */
export function updateTripStatus(tripId: string, newStatus: TripStatus): PastTrip[] {
  if (!VALID_TRIP_STATUSES.has(newStatus)) {
    return getTripHistory();
  }

  const existing = getTripHistory();
  const idx = existing.findIndex((t) => t.id === tripId);
  if (idx < 0) {
    return existing;
  }

  const updated = [...existing];
  updated[idx] = {
    ...updated[idx],
    status: newStatus,
    isPrototypeAction: true,
  };

  setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(updated));
  return updated;
}

/**
 * Delete a single trip record by ID.
 */
export function deleteTripRecord(tripId: string): PastTrip[] {
  const existing = getTripHistory();
  const updated = existing.filter((t) => t.id !== tripId);
  setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(updated));
  return updated;
}

/**
 * Reset trip history to default demo records.
 */
export function resetTripHistoryToDefaults(): PastTrip[] {
  const defaults = [...MOCK_PAST_TRIPS];
  setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(defaults));
  return defaults;
}

