/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TabType = 'home' | 'activity' | 'account';

export type ActivitySubTab = 'nearby' | 'routes' | 'history';

export interface Sacco {
  id: string;
  name: string;
  shortCode: string;
  isElectric: boolean;
  color: string;
  badgeBg: string;
  badgeText: string;
  logoIcon: string;
  corridors: string[];
  fleetCount: number;
  rating: number;
  phone: string;
}

export interface TransitStop {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  isTerminal?: boolean;
  shelter?: boolean;
  lines: string[];
}

export interface Vehicle {
  id: string;
  plate: string;
  saccoId: string;
  saccoName: string;
  routeId: string; // Valid route ID referencing RouteOption
  routeNumber: string;
  destination: string;
  origin: string;
  lat: number;
  lng: number;
  heading: number; // in degrees
  speed: number; // km/h
  isElectric: boolean;
  batteryPct?: number;
  occupancy: 'low' | 'medium' | 'high' | 'full';
  seatsAvailable: number;
  totalSeats: number;
  demoEtaMinutes: number;
  lastPingSecondsAgo: number;
  isGeometryAvailable?: boolean;
}

export interface RouteTransferInfo {
  transferStop: TransitStop;
  nextRouteId?: string;
  nextRouteCode: string;
  nextSaccoId: string;
  nextSaccoName: string;
  notes?: string;
}

export interface RouteOption {
  id: string;
  name: string;
  routeCode: string;
  saccoId: string;
  saccoName: string;
  isElectric: boolean;
  fromStop: TransitStop;
  toStop: TransitStop;
  durationMinutes: number | null;
  walkMinutes: number;
  demoFareKes: number | null;
  frequencyMinutes: number;
  co2SavedKg: number;
  stops: TransitStop[];
  waypoints: [number, number][];
  tag?: 'Fastest' | 'Pure Electric' | 'Cheapest' | 'Express';
  nextDepartures: string[]; // e.g. ["2 min", "8 min", "15 min"]
  transfersCount?: number;
  transferInfo?: RouteTransferInfo;
}

export type RouteSortMode = 'recommended' | 'fastest' | 'cheapest' | 'transfers';

export type JourneyStepType =
  | 'origin'
  | 'board'
  | 'intermediate'
  | 'transfer'
  | 'alight'
  | 'destination';

export interface JourneyDirectionStep {
  stepNumber: number;
  type: JourneyStepType;
  title: string;
  instruction: string;
  stop?: TransitStop;
  saccoName?: string;
  routeCode?: string;
  transferInfo?: RouteTransferInfo;
}

export type TripStatus = 'Planned' | 'In progress' | 'Completed' | 'Cancelled';

export interface PastTrip {
  id: string;
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
  timestamp: string; // ISO 8601 date string
  date: string;
  time: string;
  fareKes: number | null;
  mpesaRef?: string;
  isElectric: boolean;
  durationMinutes: number | null;
  status: TripStatus;
  isPrototypeAction?: boolean;
}

export type TripRecord = PastTrip;

export interface CommuterGuideSection {
  id: string;
  number: number;
  title: string;
  summary: string;
  generalGuidance: string[];
  verifyLocallyNote: string;
  terms?: { term: string; meaning: string }[];
}

export interface SavedPlace {
  id: string;
  title: string;
  address?: string;
  iconName: 'home' | 'briefcase' | 'plane' | 'map-pin' | 'shopping-bag';
  lat: number;
  lng: number;
  stopId?: string;
}

export interface RecentSearch {
  id: string;
  destination: string;
  lat: number;
  lng: number;
  timestamp: string; // ISO 8601 date string
  stopId?: string;
  saccoHint?: string;
}

export interface TransportPreferences {
  preferredSaccoIds: string[];
  prioritizePreferred: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  tier: string;
  co2SavedKg: number;
  totalTrips: number;
  m3BalanceKes: number;
  preferredSaccoIds: string[];
  language: 'en' | 'sw' | 'sheng';
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  accessibleOnly: boolean;
}

