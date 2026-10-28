/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sacco, TransitStop, Vehicle, RouteOption, PastTrip, SavedPlace, UserProfile } from '../types/transit';

export const SACCOS: Sacco[] = [
  {
    id: 'all',
    name: 'All SACCOs',
    shortCode: 'ALL',
    isElectric: false,
    color: '#0b1b3d',
    badgeBg: '#e9edff',
    badgeText: '#0b1b3d',
    logoIcon: 'bus',
    corridors: ['All Nairobi Routes'],
    fleetCount: 142,
    rating: 4.8,
    phone: '+254 700 000 000',
  },
  {
    id: 'super-metro',
    name: 'Super Metro',
    shortCode: 'SM',
    isElectric: true,
    color: '#006d43',
    badgeBg: '#e6fcf1',
    badgeText: '#006d43',
    logoIcon: 'zap',
    corridors: ['Waiyaki Way', 'Thika Road', 'Juja', 'Kikuyu', 'Ngong'],
    fleetCount: 64,
    rating: 4.9,
    phone: '+254 722 123 456',
  },
  {
    id: 'basigo',
    name: 'BasiGo Electric',
    shortCode: 'BG',
    isElectric: true,
    color: '#00e575',
    badgeBg: '#dcfce7',
    badgeText: '#047857',
    logoIcon: 'zap',
    corridors: ['JKIA Airport Express', 'CBD - Westlands', 'Embakasi', 'Buruburu'],
    fleetCount: 38,
    rating: 4.95,
    phone: '+254 711 987 654',
  },
  {
    id: 'city-hoppa',
    name: 'City Hoppa',
    shortCode: 'CH',
    isElectric: false,
    color: '#1e40af',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    logoIcon: 'bus',
    corridors: ['Ngong Road', 'Karen', 'Kawangware', 'Kenyatta Hospital', 'CBD'],
    fleetCount: 45,
    rating: 4.6,
    phone: '+254 733 456 789',
  },
  {
    id: 'metro-trans',
    name: 'Metro Trans',
    shortCode: 'MT',
    isElectric: true,
    color: '#b45309',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    logoIcon: 'zap',
    corridors: ['Waiyaki Way', 'Uthiru', 'Kinoo', 'Kikuyu'],
    fleetCount: 29,
    rating: 4.7,
    phone: '+254 720 112 233',
  },
  {
    id: 'lopha',
    name: 'Lopha Travels',
    shortCode: 'LT',
    isElectric: false,
    color: '#4338ca',
    badgeBg: '#e0e7ff',
    badgeText: '#3730a3',
    logoIcon: 'bus',
    corridors: ['Thika Superhighway', 'Ruiru', 'Kasarani', 'CBD'],
    fleetCount: 35,
    rating: 4.5,
    phone: '+254 721 998 877',
  },
  {
    id: 'kbs',
    name: 'Kenya Bus Service',
    shortCode: 'KBS',
    isElectric: false,
    color: '#991b1b',
    badgeBg: '#fee2e2',
    badgeText: '#991b1b',
    logoIcon: 'bus',
    corridors: ['South B', 'South C', 'Langata', 'Eastlands'],
    fleetCount: 32,
    rating: 4.5,
    phone: '+254 700 554 433',
  },
  {
    id: '2nk',
    name: '2NK Sacco',
    shortCode: '2NK',
    isElectric: false,
    color: '#0f766e',
    badgeBg: '#ccfbf1',
    badgeText: '#0f766e',
    logoIcon: 'bus',
    corridors: ['Thika Road', 'Nyeri-Nairobi Express'],
    fleetCount: 22,
    rating: 4.7,
    phone: '+254 725 334 455',
  },
];

export const TRANSIT_STOPS: TransitStop[] = [
  {
    id: 'stop-kencom',
    name: 'Kencom Terminal',
    area: 'CBD Core',
    lat: -1.2844,
    lng: 36.8249,
    isTerminal: true,
    shelter: true,
    lines: ['E-105', 'SM-105', 'BG-Airport', 'MT-46'],
  },
  {
    id: 'stop-ambassadeur',
    name: 'Ambassadeur / Moi Ave',
    area: 'CBD East',
    lat: -1.2868,
    lng: 36.8272,
    isTerminal: true,
    shelter: true,
    lines: ['CH-111', 'KBS-12', 'LT-237'],
  },
  {
    id: 'stop-odeon',
    name: 'Odeon Cinema Stage',
    area: 'CBD North',
    lat: -1.2818,
    lng: 36.8252,
    isTerminal: true,
    shelter: true,
    lines: ['SM-44', 'LT-237', '2NK-01'],
  },
  {
    id: 'stop-railways',
    name: 'Nairobi Central Railway',
    area: 'CBD South / Haile Selassie',
    lat: -1.2912,
    lng: 36.8285,
    isTerminal: true,
    shelter: true,
    lines: ['BG-Airport', 'CH-111', 'KBS-12'],
  },
  {
    id: 'stop-westlands',
    name: 'Westlands Stage (Sarit/The Mall)',
    area: 'Westlands',
    lat: -1.2655,
    lng: 36.8048,
    isTerminal: false,
    shelter: true,
    lines: ['E-105', 'SM-105', 'MT-46'],
  },
  {
    id: 'stop-museum-hill',
    name: 'Museum Hill Interchange',
    area: 'Parklands / Museum',
    lat: -1.2742,
    lng: 36.8142,
    isTerminal: false,
    shelter: true,
    lines: ['E-105', 'SM-105'],
  },
  {
    id: 'stop-uthiru',
    name: 'Uthiru Stage',
    area: 'Waiyaki Way Outer',
    lat: -1.2585,
    lng: 36.7320,
    isTerminal: false,
    shelter: true,
    lines: ['E-105', 'MT-46'],
  },
  {
    id: 'stop-upperhill',
    name: 'Upper Hill (Britam/Hospital Rd)',
    area: 'Upper Hill Financial District',
    lat: -1.2982,
    lng: 36.8155,
    isTerminal: false,
    shelter: true,
    lines: ['CH-111', 'KBS-12'],
  },
  {
    id: 'stop-yaya',
    name: 'Yaya Centre',
    area: 'Kilimani',
    lat: -1.2925,
    lng: 36.7876,
    isTerminal: false,
    shelter: true,
    lines: ['CH-111', 'MT-46'],
  },
  {
    id: 'stop-junction',
    name: 'The Junction Mall',
    area: 'Ngong Road',
    lat: -1.2988,
    lng: 36.7622,
    isTerminal: false,
    shelter: true,
    lines: ['CH-111'],
  },
  {
    id: 'stop-karen',
    name: 'Karen Shopping Centre',
    area: 'Karen',
    lat: -1.3195,
    lng: 36.7067,
    isTerminal: true,
    shelter: true,
    lines: ['CH-111'],
  },
  {
    id: 'stop-pangani',
    name: 'Pangani Interchange',
    area: 'Thika Rd / Ring Rd',
    lat: -1.2720,
    lng: 36.8375,
    isTerminal: false,
    shelter: true,
    lines: ['SM-44', 'LT-237'],
  },
  {
    id: 'stop-roysambu',
    name: 'Roysambu Roundabout (TRM)',
    area: 'Thika Superhighway',
    lat: -1.2185,
    lng: 36.8876,
    isTerminal: false,
    shelter: true,
    lines: ['SM-44', 'LT-237', '2NK-01'],
  },
  {
    id: 'stop-kasarani',
    name: 'Kasarani Sports View',
    area: 'Kasarani',
    lat: -1.2260,
    lng: 36.8970,
    isTerminal: true,
    shelter: true,
    lines: ['SM-44', 'LT-237'],
  },
  {
    id: 'stop-jkia',
    name: 'JKIA Airport Terminals 1 & 2',
    area: 'Embakasi South',
    lat: -1.3323,
    lng: 36.9275,
    isTerminal: true,
    shelter: true,
    lines: ['BG-Airport'],
  },
];

// Dense, road-following coordinate polylines for Nairobi's major arterial transit corridors
export const CORRIDOR_WAYPOINTS = {
  // Waiyaki Way Corridor (CBD Kencom <-> Westlands [0..9] <-> Uthiru [9..19])
  waiyakiWay: [
    [-1.2844, 36.8249], // 0: Kencom Terminal
    [-1.2831, 36.8228], // 1: Moi Ave / City Hall Way
    [-1.2810, 36.8188], // 2: University Way roundabout
    [-1.2785, 36.8164], // 3: Uhuru Highway
    [-1.2758, 36.8150], // 4: Approaching Museum Hill
    [-1.2742, 36.8142], // 5: Museum Hill flyover
    [-1.2720, 36.8130], // 6: Chiromo curve
    [-1.2690, 36.8100], // 7: Chiromo Bypass
    [-1.2670, 36.8075], // 8: Kempinski curve
    [-1.2655, 36.8048], // 9: Westlands Stage (Sarit/The Mall)
    [-1.2644, 36.8010], // 10: Safaricom HQ / Waiyaki Way
    [-1.2635, 36.7970], // 11: ABC Place
    [-1.2625, 36.7915], // 12: James Gichuru Junction
    [-1.2618, 36.7860], // 13: Loresho Turnoff / Waiyaki Way curve
    [-1.2610, 36.7790], // 14: Kangemi approach
    [-1.2605, 36.7720], // 15: Kangemi flyover
    [-1.2598, 36.7635], // 16: Mountain View approach
    [-1.2595, 36.7550], // 17: Mountain View stage
    [-1.2590, 36.7435], // 18: Kinoo / 87 stage
    [-1.2585, 36.7320], // 19: Uthiru Stage
  ] as [number, number][],

  // Thika Superhighway Corridor (CBD Odeon <-> Pangani <-> Roysambu <-> Kasarani)
  thikaHighway: [
    [-1.2818, 36.8252], // Odeon Cinema
    [-1.2798, 36.8270], // Tom Mboya / Koja roundabout
    [-1.2765, 36.8315], // Ngara roundabout
    [-1.2738, 36.8350], // Murang'a Rd curve
    [-1.2720, 36.8375], // Pangani Interchange
    [-1.2660, 36.8450], // Muthaiga Interchange
    [-1.2580, 36.8520], // Guru Nanak
    [-1.2510, 36.8590], // Survey of Kenya curve
    [-1.2420, 36.8680], // Allsopps / Ruaraka
    [-1.2350, 36.8745], // Garden City Mall
    [-1.2265, 36.8810], // Mountain Mall
    [-1.2185, 36.8876], // Roysambu Roundabout (TRM)
    [-1.2215, 36.8920], // Kasarani turnoff
    [-1.2260, 36.8970], // Kasarani Sports View
  ] as [number, number][],

  // Ngong Road - Karen Corridor (CBD Ambassadeur <-> Upper Hill <-> Yaya <-> Karen)
  ngongRoad: [
    [-1.2868, 36.8272], // Ambassadeur / Moi Ave
    [-1.2905, 36.8250], // Haile Selassie Ave curve
    [-1.2935, 36.8210], // Railway roundabout
    [-1.2970, 36.8175], // Community flyover
    [-1.2982, 36.8155], // Upper Hill (Britam / Hospital Rd)
    [-1.2995, 36.8100], // Kenyatta National Hospital roundabout
    [-1.2975, 36.8040], // City Mortuary roundabout
    [-1.2955, 36.7970], // Daystar curve
    [-1.2935, 36.7920], // Hurlingham curve
    [-1.2925, 36.7876], // Yaya Centre link
    [-1.2950, 36.7790], // Adams Arcade
    [-1.2970, 36.7700], // Impala Club curve
    [-1.2988, 36.7622], // The Junction Mall
    [-1.3025, 36.7520], // Dagoretti Corner
    [-1.3080, 36.7410], // Lenana curve
    [-1.3140, 36.7260], // Karen Triangle
    [-1.3195, 36.7067], // Karen Shopping Centre
  ] as [number, number][],

  // Mombasa Road / Expressway (CBD Railways <-> JKIA Airport)
  mombasaRoad: [
    [-1.2912, 36.8285], // Railways Central
    [-1.2950, 36.8310], // Workshop Rd
    [-1.2990, 36.8325], // Bunyala roundabout
    [-1.3030, 36.8335], // Nyayo Stadium flyover
    [-1.3075, 36.8385], // Lusaka Rd interchange
    [-1.3125, 36.8480], // South C / Bellevue
    [-1.3180, 36.8580], // Sameer Business Park
    [-1.3210, 36.8620], // Panari Hotel
    [-1.3255, 36.8740], // General Motors
    [-1.3285, 36.8835], // Imara Daima / Cabanas approach
    [-1.3310, 36.8930], // City Cabanas interchange
    [-1.3330, 36.9000], // Eastern Bypass / Airport North junction
    [-1.3340, 36.9060], // Airport North Rd
    [-1.3345, 36.9180], // JKIA Entry
    [-1.3323, 36.9275], // JKIA Terminals 1 & 2
  ] as [number, number][],

  // Upper Hill Community Corridor (Ambassadeur <-> Railways <-> Upper Hill Britam)
  upperHillLoop: [
    [-1.2868, 36.8272], // Ambassadeur / Moi Ave
    [-1.2888, 36.8278], // Moi Ave South / Haile Selassie junction
    [-1.2912, 36.8285], // Nairobi Central Railway
    [-1.2920, 36.8252], // Haile Selassie Ave West
    [-1.2935, 36.8210], // Uhuru Highway / Haile Selassie roundabout
    [-1.2950, 36.8210], // Community / Upper Hill approach
    [-1.2964, 36.8190], // Ragati Rd / Kenyatta Ave link
    [-1.2975, 36.8172], // Hospital Rd / Britam Tower approach
    [-1.2982, 36.8155], // Upper Hill (Britam / Hospital Rd)
  ] as [number, number][],

  // CBD Arterial Connector (Odeon <-> Kencom <-> Ambassadeur <-> Railways)
  cbdLoop: [
    [-1.2818, 36.8252], // Odeon Cinema Stage
    [-1.2830, 36.8248], // Moi Ave Central
    [-1.2844, 36.8249], // Kencom Terminal
    [-1.2856, 36.8260], // Moi Ave / City Hall Way
    [-1.2868, 36.8272], // Ambassadeur / Moi Ave
    [-1.2890, 36.8279], // Moi Ave South
    [-1.2912, 36.8285], // Nairobi Central Railway
  ] as [number, number][],
};

export const MOCK_ROUTES: RouteOption[] = [
  // 1. Kencom to Westlands (Waiyaki Way Green Line)
  {
    id: 'route-e105-westlands',
    name: 'Waiyaki Way Green Line',
    routeCode: 'E-105',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    isElectric: true,
    fromStop: TRANSIT_STOPS[0], // Kencom
    toStop: TRANSIT_STOPS[4], // Westlands
    durationMinutes: 16,
    walkMinutes: 3,
    demoFareKes: 70,
    frequencyMinutes: 4,
    co2SavedKg: 1.4,
    tag: 'Pure Electric',
    nextDepartures: ['2 min', '6 min', '12 min'],
    stops: [
      TRANSIT_STOPS[0], // Kencom
      TRANSIT_STOPS[5], // Museum Hill
      TRANSIT_STOPS[4], // Westlands
    ],
    waypoints: CORRIDOR_WAYPOINTS.waiyakiWay.slice(0, 10),
  },

  // 2. Westlands to Kencom (Reverse Green Line)
  {
    id: 'route-e105-kencom',
    name: 'Waiyaki Way Green Line (CBD Bound)',
    routeCode: 'E-105-REV',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    isElectric: true,
    fromStop: TRANSIT_STOPS[4], // Westlands
    toStop: TRANSIT_STOPS[0], // Kencom
    durationMinutes: 15,
    walkMinutes: 2,
    demoFareKes: 70,
    frequencyMinutes: 4,
    co2SavedKg: 1.4,
    tag: 'Pure Electric',
    nextDepartures: ['3 min', '7 min', '14 min'],
    stops: [
      TRANSIT_STOPS[4], // Westlands
      TRANSIT_STOPS[5], // Museum Hill
      TRANSIT_STOPS[0], // Kencom
    ],
    waypoints: [...CORRIDOR_WAYPOINTS.waiyakiWay.slice(0, 10)].reverse(),
  },

  // 3. Super Metro Waiyaki Express
  {
    id: 'route-sm105-westlands',
    name: 'Super Metro Waiyaki Express',
    routeCode: 'SM-105',
    saccoId: 'super-metro',
    saccoName: 'Super Metro',
    isElectric: true,
    fromStop: TRANSIT_STOPS[0], // Kencom
    toStop: TRANSIT_STOPS[4], // Westlands
    durationMinutes: 14,
    walkMinutes: 2,
    demoFareKes: 60,
    frequencyMinutes: 3,
    co2SavedKg: 1.2,
    tag: 'Fastest',
    nextDepartures: ['3 min', '7 min', '11 min'],
    stops: [
      TRANSIT_STOPS[0],
      TRANSIT_STOPS[5],
      TRANSIT_STOPS[4],
    ],
    waypoints: CORRIDOR_WAYPOINTS.waiyakiWay.slice(0, 10),
  },

  // 4. Thika Superhighway Rapid (CBD Odeon to Kasarani)
  {
    id: 'route-sm44-thika',
    name: 'Thika Superhighway Rapid',
    routeCode: 'SM-44',
    saccoId: 'super-metro',
    saccoName: 'Super Metro',
    isElectric: true,
    fromStop: TRANSIT_STOPS[2], // Odeon
    toStop: TRANSIT_STOPS[13], // Kasarani
    durationMinutes: 26,
    walkMinutes: 4,
    demoFareKes: 80,
    frequencyMinutes: 5,
    co2SavedKg: 2.1,
    tag: 'Fastest',
    nextDepartures: ['4 min', '9 min', '15 min'],
    stops: [
      TRANSIT_STOPS[2], // Odeon
      TRANSIT_STOPS[11], // Pangani
      TRANSIT_STOPS[12], // Roysambu
      TRANSIT_STOPS[13], // Kasarani
    ],
    waypoints: CORRIDOR_WAYPOINTS.thikaHighway,
  },

  // 5. Kasarani/Roysambu to CBD (Reverse Thika)
  {
    id: 'route-sm44-odeon',
    name: 'Thika Superhighway Rapid (CBD Bound)',
    routeCode: 'SM-44-REV',
    saccoId: 'super-metro',
    saccoName: 'Super Metro',
    isElectric: true,
    fromStop: TRANSIT_STOPS[13], // Kasarani
    toStop: TRANSIT_STOPS[2], // Odeon
    durationMinutes: 25,
    walkMinutes: 3,
    demoFareKes: 80,
    frequencyMinutes: 5,
    co2SavedKg: 2.1,
    tag: 'Fastest',
    nextDepartures: ['2 min', '8 min', '14 min'],
    stops: [
      TRANSIT_STOPS[13],
      TRANSIT_STOPS[12],
      TRANSIT_STOPS[11],
      TRANSIT_STOPS[2],
    ],
    waypoints: [...CORRIDOR_WAYPOINTS.thikaHighway].reverse(),
  },

  // 6. Ngong Road - Karen Corridor (CBD Ambassadeur to Karen)
  {
    id: 'route-ch111-karen',
    name: 'Ngong Road - Karen Corridor',
    routeCode: 'CH-111',
    saccoId: 'city-hoppa',
    saccoName: 'City Hoppa',
    isElectric: false,
    fromStop: TRANSIT_STOPS[1], // Ambassadeur
    toStop: TRANSIT_STOPS[10], // Karen
    durationMinutes: 38,
    walkMinutes: 5,
    demoFareKes: 90,
    frequencyMinutes: 8,
    co2SavedKg: 0.8,
    tag: 'Cheapest',
    nextDepartures: ['7 min', '16 min', '25 min'],
    stops: [
      TRANSIT_STOPS[1], // Ambassadeur
      TRANSIT_STOPS[7], // Upper Hill
      TRANSIT_STOPS[8], // Yaya
      TRANSIT_STOPS[9], // Junction
      TRANSIT_STOPS[10], // Karen
    ],
    waypoints: CORRIDOR_WAYPOINTS.ngongRoad,
  },

  // 7. Karen to CBD (Reverse Ngong Rd)
  {
    id: 'route-ch111-cbd',
    name: 'Karen - Ngong Road (CBD Bound)',
    routeCode: 'CH-111-REV',
    saccoId: 'city-hoppa',
    saccoName: 'City Hoppa',
    isElectric: false,
    fromStop: TRANSIT_STOPS[10], // Karen
    toStop: TRANSIT_STOPS[1], // Ambassadeur
    durationMinutes: 36,
    walkMinutes: 4,
    demoFareKes: 90,
    frequencyMinutes: 8,
    co2SavedKg: 0.8,
    tag: 'Cheapest',
    nextDepartures: ['5 min', '14 min', '22 min'],
    stops: [
      TRANSIT_STOPS[10],
      TRANSIT_STOPS[9],
      TRANSIT_STOPS[8],
      TRANSIT_STOPS[7],
      TRANSIT_STOPS[1],
    ],
    waypoints: [...CORRIDOR_WAYPOINTS.ngongRoad].reverse(),
  },

  // 8. JKIA Airport Electric Shuttle (Railways to JKIA)
  {
    id: 'route-bg-airport',
    name: 'JKIA Airport Electric Shuttle',
    routeCode: 'BG-Airport',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    isElectric: true,
    fromStop: TRANSIT_STOPS[3], // Railways
    toStop: TRANSIT_STOPS[14], // JKIA
    durationMinutes: 24,
    walkMinutes: 2,
    demoFareKes: 150,
    frequencyMinutes: 15,
    co2SavedKg: 3.5,
    tag: 'Express',
    nextDepartures: ['8 min', '23 min', '38 min'],
    stops: [
      TRANSIT_STOPS[3], // Railways
      TRANSIT_STOPS[14], // JKIA
    ],
    waypoints: CORRIDOR_WAYPOINTS.mombasaRoad,
  },

  // 9. JKIA to CBD (Reverse Airport)
  {
    id: 'route-bg-airport-cbd',
    name: 'JKIA Airport Electric Shuttle (CBD Bound)',
    routeCode: 'BG-Airport-REV',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    isElectric: true,
    fromStop: TRANSIT_STOPS[14], // JKIA
    toStop: TRANSIT_STOPS[3], // Railways
    durationMinutes: 24,
    walkMinutes: 2,
    demoFareKes: 150,
    frequencyMinutes: 15,
    co2SavedKg: 3.5,
    tag: 'Express',
    nextDepartures: ['10 min', '25 min', '40 min'],
    stops: [
      TRANSIT_STOPS[14],
      TRANSIT_STOPS[3],
    ],
    waypoints: [...CORRIDOR_WAYPOINTS.mombasaRoad].reverse(),
  },

  // 10. Lopha Travels Thika Shuttle
  {
    id: 'route-lt237-roysambu',
    name: 'Thika Rd High Frequency Shuttle',
    routeCode: 'LT-237',
    saccoId: 'lopha',
    saccoName: 'Lopha Travels',
    isElectric: false,
    fromStop: TRANSIT_STOPS[2], // Odeon
    toStop: TRANSIT_STOPS[12], // Roysambu
    durationMinutes: 22,
    walkMinutes: 3,
    demoFareKes: 70,
    frequencyMinutes: 6,
    co2SavedKg: 1.1,
    tag: 'Cheapest',
    nextDepartures: ['5 min', '11 min', '18 min'],
    stops: [
      TRANSIT_STOPS[2],
      TRANSIT_STOPS[11],
      TRANSIT_STOPS[12],
    ],
    waypoints: CORRIDOR_WAYPOINTS.thikaHighway.slice(0, 12),
  },

  // 11. Metro Trans Waiyaki - Uthiru
  {
    id: 'route-mt46-uthiru',
    name: 'Metro Trans Waiyaki - Uthiru Line',
    routeCode: 'MT-46',
    saccoId: 'metro-trans',
    saccoName: 'Metro Trans',
    isElectric: true,
    fromStop: TRANSIT_STOPS[0], // Kencom
    toStop: TRANSIT_STOPS[6], // Uthiru
    durationMinutes: 28,
    walkMinutes: 3,
    demoFareKes: 80,
    frequencyMinutes: 7,
    co2SavedKg: 1.8,
    tag: 'Fastest',
    nextDepartures: ['4 min', '12 min', '20 min'],
    stops: [
      TRANSIT_STOPS[0],
      TRANSIT_STOPS[5],
      TRANSIT_STOPS[4],
      TRANSIT_STOPS[6],
    ],
    waypoints: CORRIDOR_WAYPOINTS.waiyakiWay,
  },

  // 12. KBS South C / Upper Hill
  {
    id: 'route-kbs12-upperhill',
    name: 'KBS Upper Hill - Community Express',
    routeCode: 'KBS-12',
    saccoId: 'kbs',
    saccoName: 'Kenya Bus Service',
    isElectric: false,
    fromStop: TRANSIT_STOPS[1], // Ambassadeur
    toStop: TRANSIT_STOPS[7], // Upper Hill
    durationMinutes: 18,
    walkMinutes: 3,
    demoFareKes: 50,
    frequencyMinutes: 10,
    co2SavedKg: 0.6,
    tag: 'Cheapest',
    nextDepartures: ['6 min', '16 min', '26 min'],
    stops: [
      TRANSIT_STOPS[1],
      TRANSIT_STOPS[3],
      TRANSIT_STOPS[7],
    ],
    waypoints: CORRIDOR_WAYPOINTS.upperHillLoop,
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v-01',
    plate: 'KDG 812B',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    routeId: 'route-e105-westlands',
    routeNumber: 'E-105',
    destination: 'Westlands (Sarit)',
    origin: 'Kencom CBD',
    lat: -1.2785,
    lng: 36.8164,
    heading: 320,
    speed: 38,
    isElectric: true,
    batteryPct: 88,
    occupancy: 'low',
    seatsAvailable: 14,
    totalSeats: 33,
    demoEtaMinutes: 3,
    lastPingSecondsAgo: 4,
    isGeometryAvailable: true,
  },
  {
    id: 'v-02',
    plate: 'KDF 399M',
    saccoId: 'super-metro',
    saccoName: 'Super Metro',
    routeId: 'route-sm105-westlands',
    routeNumber: 'SM-105',
    destination: 'Westlands (Sarit)',
    origin: 'Kencom CBD',
    lat: -1.2690,
    lng: 36.8100,
    heading: 305,
    speed: 42,
    isElectric: true,
    batteryPct: 76,
    occupancy: 'medium',
    seatsAvailable: 7,
    totalSeats: 33,
    demoEtaMinutes: 6,
    lastPingSecondsAgo: 8,
    isGeometryAvailable: true,
  },
  {
    id: 'v-03',
    plate: 'KDC 551X',
    saccoId: 'city-hoppa',
    saccoName: 'City Hoppa',
    routeId: 'route-ch111-karen',
    routeNumber: 'CH-111',
    destination: 'Karen Shopping Centre',
    origin: 'Ambassadeur CBD',
    lat: -1.2955,
    lng: 36.7970,
    heading: 240,
    speed: 28,
    isElectric: false,
    occupancy: 'high',
    seatsAvailable: 3,
    totalSeats: 46,
    demoEtaMinutes: 8,
    lastPingSecondsAgo: 12,
    isGeometryAvailable: true,
  },
  {
    id: 'v-04',
    plate: 'KDJ 104E',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    routeId: 'route-bg-airport',
    routeNumber: 'BG-Airport',
    destination: 'JKIA Airport Terminals',
    origin: 'Railways CBD',
    lat: -1.3125,
    lng: 36.8480,
    heading: 135,
    speed: 62,
    isElectric: true,
    batteryPct: 91,
    occupancy: 'low',
    seatsAvailable: 18,
    totalSeats: 33,
    demoEtaMinutes: 12,
    lastPingSecondsAgo: 3,
    isGeometryAvailable: true,
  },
  {
    id: 'v-05',
    plate: 'KDE 762T',
    saccoId: 'super-metro',
    saccoName: 'Super Metro',
    routeId: 'route-sm44-thika',
    routeNumber: 'SM-44',
    destination: 'Kasarani Sports View',
    origin: 'Odeon CBD',
    lat: -1.2510,
    lng: 36.8590,
    heading: 45,
    speed: 55,
    isElectric: true,
    batteryPct: 64,
    occupancy: 'medium',
    seatsAvailable: 9,
    totalSeats: 33,
    demoEtaMinutes: 5,
    lastPingSecondsAgo: 6,
    isGeometryAvailable: true,
  },
  {
    id: 'v-06',
    plate: 'KDD 408Z',
    saccoId: 'lopha',
    saccoName: 'Lopha Travels',
    routeId: 'route-lt237-roysambu',
    routeNumber: 'LT-237',
    destination: 'Roysambu Roundabout',
    origin: 'Odeon CBD',
    lat: -1.2580,
    lng: 36.8520,
    heading: 50,
    speed: 48,
    isElectric: false,
    occupancy: 'high',
    seatsAvailable: 2,
    totalSeats: 33,
    demoEtaMinutes: 9,
    lastPingSecondsAgo: 15,
    isGeometryAvailable: true,
  },
  {
    id: 'v-07',
    plate: 'KDA 930H',
    saccoId: 'metro-trans',
    saccoName: 'Metro Trans',
    routeId: 'route-mt46-uthiru',
    routeNumber: 'MT-46',
    destination: 'Uthiru Stage',
    origin: 'Kencom CBD',
    lat: -1.2635,
    lng: 36.7970,
    heading: 310,
    speed: 34,
    isElectric: true,
    batteryPct: 82,
    occupancy: 'low',
    seatsAvailable: 15,
    totalSeats: 33,
    demoEtaMinutes: 4,
    lastPingSecondsAgo: 5,
    isGeometryAvailable: true,
  },
  {
    id: 'v-08',
    plate: 'KCG 611Y',
    saccoId: 'kbs',
    saccoName: 'Kenya Bus Service',
    routeId: 'route-kbs12-upperhill',
    routeNumber: 'KBS-12',
    destination: 'Upper Hill Financial',
    origin: 'Ambassadeur CBD',
    lat: -1.2950,
    lng: 36.8210,
    heading: 215,
    speed: 25,
    isElectric: false,
    occupancy: 'full',
    seatsAvailable: 0,
    totalSeats: 52,
    demoEtaMinutes: 11,
    lastPingSecondsAgo: 18,
    isGeometryAvailable: true,
  },
];

export const MOCK_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'sp-home',
    title: 'Home',
    address: 'Ring Road, Kilimani (Near Yaya Centre)',
    iconName: 'home',
    lat: -1.2925,
    lng: 36.7876,
  },
  {
    id: 'sp-work',
    title: 'Work',
    address: 'Sarit Centre Business Park, Westlands',
    iconName: 'briefcase',
    lat: -1.2655,
    lng: 36.8048,
  },
  {
    id: 'sp-airport',
    title: 'JKIA Airport',
    address: 'Terminal 1A Departures, Embakasi',
    iconName: 'plane',
    lat: -1.3323,
    lng: 36.9275,
  },
  {
    id: 'sp-kencom',
    title: 'Kencom CBD',
    address: 'Moi Avenue / City Hall Way, Nairobi',
    iconName: 'map-pin',
    lat: -1.2844,
    lng: 36.8249,
  },
];

export const MOCK_PAST_TRIPS: PastTrip[] = [
  {
    id: 'trip-001',
    origin: 'Kencom Terminal',
    originLat: -1.2844,
    originLng: 36.8249,
    originStopId: 'stop-kencom',
    destination: 'Westlands Stage (Sarit/The Mall)',
    destinationLat: -1.2655,
    destinationLng: 36.8048,
    destinationStopId: 'stop-westlands',
    routeId: 'route-sm105-westlands',
    routeCode: 'SM-105',
    routeName: 'Super Metro Waiyaki Express',
    saccoId: 'super-metro',
    saccoName: 'Super Metro',
    timestamp: '2026-10-26T08:42:00.000Z',
    date: '26 Oct',
    time: '08:42 AM',
    fareKes: 60,
    mpesaRef: 'DEMO-792LMPA',
    isElectric: true,
    durationMinutes: 14,
    status: 'Completed',
    isPrototypeAction: true,
  },
  {
    id: 'trip-002',
    origin: 'Westlands Stage (Sarit/The Mall)',
    originLat: -1.2655,
    originLng: 36.8048,
    originStopId: 'stop-westlands',
    destination: 'Kencom Terminal',
    destinationLat: -1.2844,
    destinationLng: 36.8249,
    destinationStopId: 'stop-kencom',
    routeId: 'route-e105-kencom',
    routeCode: 'E-105-REV',
    routeName: 'Waiyaki Way Green Line (CBD Bound)',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    timestamp: '2026-10-25T17:30:00.000Z',
    date: '25 Oct',
    time: '05:30 PM',
    fareKes: 70,
    mpesaRef: 'DEMO-4419ZKP',
    isElectric: true,
    durationMinutes: 15,
    status: 'Completed',
    isPrototypeAction: true,
  },
  {
    id: 'trip-003',
    origin: 'Ambassadeur / Moi Ave',
    originLat: -1.2868,
    originLng: 36.8272,
    originStopId: 'stop-ambassadeur',
    destination: 'Karen Shopping Centre',
    destinationLat: -1.3195,
    destinationLng: 36.7067,
    destinationStopId: 'stop-karen',
    routeId: 'route-ch111-karen',
    routeCode: 'CH-111',
    routeName: 'Ngong Road - Karen Corridor',
    saccoId: 'city-hoppa',
    saccoName: 'City Hoppa',
    timestamp: '2026-10-24T14:15:00.000Z',
    date: '24 Oct',
    time: '02:15 PM',
    fareKes: 90,
    mpesaRef: 'DEMO-1107LMS',
    isElectric: false,
    durationMinutes: 38,
    status: 'Completed',
    isPrototypeAction: true,
  },
  {
    id: 'trip-004',
    origin: 'Nairobi Central Railway',
    originLat: -1.2912,
    originLng: 36.8285,
    originStopId: 'stop-railways',
    destination: 'JKIA Airport Terminals 1 & 2',
    destinationLat: -1.3323,
    destinationLng: 36.9275,
    destinationStopId: 'stop-jkia',
    routeId: 'route-bg-airport',
    routeCode: 'BG-Airport',
    routeName: 'JKIA Airport Electric Shuttle',
    saccoId: 'basigo',
    saccoName: 'BasiGo Electric',
    timestamp: '2026-10-22T11:10:00.000Z',
    date: '22 Oct',
    time: '11:10 AM',
    fareKes: 150,
    mpesaRef: 'DEMO-8894PLK',
    isElectric: true,
    durationMinutes: 24,
    status: 'Completed',
    isPrototypeAction: true,
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Aj Muchiri',
  email: 'ajmuchiri123@gmail.com',
  phone: '+254 712 345 678',
  tier: 'Electric Commuter • Level 3',
  co2SavedKg: 42.8,
  totalTrips: 34,
  m3BalanceKes: 1450,
  preferredSaccoIds: ['super-metro', 'basigo', 'city-hoppa'],
  language: 'en',
  notificationsEnabled: true,
  locationEnabled: true,
  accessibleOnly: false,
};

/**
 * Calculate distance between two lat/lng points in meters
 */
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
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
 * Stop Matching Helper: Finds a TransitStop matching a user search query or location name.
 * Strictly returns undefined if no match is found, preventing silent fallback to Westlands or any hardcoded default.
 */
export function matchStopByQuery(query: string): TransitStop | undefined {
  if (!query || !query.trim()) return undefined;
  const q = query.toLowerCase().trim();

  // 1. Kencom Stage
  if (q.includes('kencom') || q.includes('city hall')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-kencom');
  }
  // 2. Westlands / Sarit Centre
  if (q.includes('sarit') || q.includes('westland') || q.includes('the mall')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-westlands');
  }
  // 3. Yaya Centre / Kilimani
  if (q.includes('yaya') || q.includes('kilimani')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-yaya');
  }
  // 4. Karen
  if (q.includes('karen')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-karen');
  }
  // 5. JKIA Airport
  if (q.includes('airport') || q.includes('jkia') || q.includes('embakasi')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-jkia');
  }
  // 6. Upper Hill
  if (q.includes('upper hill') || q.includes('britam') || q.includes('hospital rd')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-upperhill');
  }
  // 7. Junction Mall
  if (q.includes('junction')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-junction');
  }
  // 8. Roysambu / TRM
  if (q.includes('roysambu') || q.includes('trm')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-roysambu');
  }
  // 9. Kasarani
  if (q.includes('kasarani') || q.includes('sports view')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-kasarani');
  }
  // 10. Uthiru / Kinoo
  if (q.includes('uthiru') || q.includes('kinoo')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-uthiru');
  }
  // 11. Museum Hill
  if (q.includes('museum') || q.includes('parklands')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-museum-hill');
  }
  // 12. Pangani
  if (q.includes('pangani')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-pangani');
  }
  // 13. Railways / Haile Selassie
  if (q.includes('railway') || q.includes('haile selassie')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-railways');
  }
  // 14. Odeon
  if (q.includes('odeon')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-odeon');
  }
  // 15. Ambassadeur / Moi Ave
  if (q.includes('ambassadeur') || q.includes('moi ave')) {
    return TRANSIT_STOPS.find((s) => s.id === 'stop-ambassadeur');
  }

  // Exact ID match check
  const idMatch = TRANSIT_STOPS.find((s) => s.id === q);
  if (idMatch) return idMatch;

  // Substring match on stop name or area
  return TRANSIT_STOPS.find(
    (s) => s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q)
  );
}

/**
 * Helper to classify which corridor a stop primarily belongs to
 */
function getStopCorridorKey(stopId: string): 'cbd' | 'waiyaki' | 'thika' | 'ngong' | 'mombasa' | 'upperhill' {
  if (['stop-kencom', 'stop-ambassadeur', 'stop-odeon', 'stop-railways'].includes(stopId)) {
    return 'cbd';
  }
  if (['stop-westlands', 'stop-museum-hill', 'stop-uthiru'].includes(stopId)) {
    return 'waiyaki';
  }
  if (['stop-pangani', 'stop-roysambu', 'stop-kasarani'].includes(stopId)) {
    return 'thika';
  }
  if (['stop-yaya', 'stop-junction', 'stop-karen'].includes(stopId)) {
    return 'ngong';
  }
  if (stopId === 'stop-jkia') {
    return 'mombasa';
  }
  return 'upperhill';
}

function getCorridorWaypointsForKey(
  key: 'cbd' | 'waiyaki' | 'thika' | 'ngong' | 'mombasa' | 'upperhill'
): [number, number][] {
  switch (key) {
    case 'waiyaki':
      return CORRIDOR_WAYPOINTS.waiyakiWay;
    case 'thika':
      return CORRIDOR_WAYPOINTS.thikaHighway;
    case 'ngong':
      return CORRIDOR_WAYPOINTS.ngongRoad;
    case 'mombasa':
      return CORRIDOR_WAYPOINTS.mombasaRoad;
    case 'upperhill':
      return CORRIDOR_WAYPOINTS.upperHillLoop;
    case 'cbd':
    default:
      return CORRIDOR_WAYPOINTS.cbdLoop;
  }
}

/**
 * Slices a corridor polyline in the direction of travel between two target coordinates.
 */
function sliceCorridorBetweenCoords(
  corridor: [number, number][],
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): [number, number][] {
  let bestFromIdx = 0;
  let bestFromDist = Infinity;
  let bestToIdx = 0;
  let bestToDist = Infinity;

  corridor.forEach((pt, idx) => {
    const dFrom = getDistanceMeters(pt[0], pt[1], fromLat, fromLng);
    if (dFrom < bestFromDist) {
      bestFromDist = dFrom;
      bestFromIdx = idx;
    }
    const dTo = getDistanceMeters(pt[0], pt[1], toLat, toLng);
    if (dTo < bestToDist) {
      bestToDist = dTo;
      bestToIdx = idx;
    }
  });

  if (bestFromIdx <= bestToIdx) {
    return corridor.slice(bestFromIdx, bestToIdx + 1);
  }
  return corridor.slice(bestToIdx, bestFromIdx + 1).reverse();
}

/**
 * Appends waypoints to an existing path while deduplicating nearly-identical consecutive points.
 */
function appendWaypoints(path: [number, number][], points: [number, number][]): void {
  points.forEach((pt) => {
    if (path.length === 0) {
      path.push([pt[0], pt[1]]);
      return;
    }
    const last = path[path.length - 1];
    if (getDistanceMeters(last[0], last[1], pt[0], pt[1]) > 15) {
      path.push([pt[0], pt[1]]);
    }
  });
}

/**
 * Route Resolver: Returns or generates a road-following route connecting two stops.
 * Returns null if endpoints are missing, identical, or if valid road geometry cannot be formed.
 */
export function findOrCreateRoute(
  fromStop: TransitStop | null | undefined,
  toStop: TransitStop | null | undefined,
  saccoId = 'all',
  isElectricOnly = false
): RouteOption | null {
  if (!fromStop || !toStop || fromStop.id === toStop.id) {
    return null;
  }

  // Check if a direct pre-configured route exists
  const directMatch = MOCK_ROUTES.find(
    (r) =>
      r.fromStop.id === fromStop.id &&
      r.toStop.id === toStop.id &&
      (saccoId === 'all' || r.saccoId === saccoId) &&
      (!isElectricOnly || r.isElectric)
  );
  if (directMatch) {
    return {
      ...directMatch,
      transfersCount: directMatch.transfersCount ?? 0,
    };
  }

  // Check if a reverse route exists
  const reverseMatch = MOCK_ROUTES.find(
    (r) =>
      r.fromStop.id === toStop.id &&
      r.toStop.id === fromStop.id &&
      (saccoId === 'all' || r.saccoId === saccoId) &&
      (!isElectricOnly || r.isElectric)
  );
  if (reverseMatch) {
    return {
      ...reverseMatch,
      id: `${reverseMatch.id}-dyn-rev`,
      name: `${reverseMatch.name} (Return)`,
      fromStop,
      toStop,
      stops: [...reverseMatch.stops].reverse(),
      waypoints: [...reverseMatch.waypoints].reverse(),
      transfersCount: reverseMatch.transfersCount ?? 0,
    };
  }

  // Determine operator and electric status based on corridor
  let isElectric = true;
  let sacco = SACCOS[1]; // Super Metro

  if (toStop.id === 'stop-jkia' || fromStop.id === 'stop-jkia') {
    sacco = SACCOS[2]; // BasiGo
  } else if (
    toStop.id === 'stop-karen' ||
    fromStop.id === 'stop-karen' ||
    toStop.id === 'stop-junction' ||
    fromStop.id === 'stop-junction' ||
    toStop.id === 'stop-yaya' ||
    fromStop.id === 'stop-yaya'
  ) {
    isElectric = false;
    sacco = SACCOS[3]; // City Hoppa
  } else if (
    toStop.id === 'stop-roysambu' ||
    fromStop.id === 'stop-roysambu' ||
    toStop.id === 'stop-kasarani' ||
    fromStop.id === 'stop-kasarani' ||
    toStop.id === 'stop-pangani' ||
    fromStop.id === 'stop-pangani'
  ) {
    sacco = SACCOS[1]; // Super Metro
  } else if (toStop.id === 'stop-upperhill' || fromStop.id === 'stop-upperhill') {
    sacco = SACCOS[3]; // City Hoppa
    isElectric = false;
  }

  if (saccoId !== 'all') {
    const requestedSacco = SACCOS.find((s) => s.id === saccoId);
    if (requestedSacco) {
      sacco = requestedSacco;
      isElectric = requestedSacco.isElectric;
    }
  } else if (isElectricOnly && !isElectric) {
    sacco = SACCOS[1]; // Super Metro electric fleet
    isElectric = true;
  }

  const fromCorridorKey = getStopCorridorKey(fromStop.id);
  const toCorridorKey = getStopCorridorKey(toStop.id);
  const needsCbdTransfer =
    fromCorridorKey !== 'cbd' &&
    toCorridorKey !== 'cbd' &&
    fromCorridorKey !== toCorridorKey;

  const path: [number, number][] = [[fromStop.lat, fromStop.lng]];

  if (needsCbdTransfer) {
    // Stitch Leg 1 (inbound along fromCorridor to its CBD hub), CBD road connector, and Leg 2 (outbound along toCorridor)
    const fromCorridor = getCorridorWaypointsForKey(fromCorridorKey);
    const toCorridor = getCorridorWaypointsForKey(toCorridorKey);
    const fromCbdHub = fromCorridor[0];
    const toCbdHub = toCorridor[0];

    const inboundLeg = sliceCorridorBetweenCoords(
      fromCorridor,
      fromStop.lat,
      fromStop.lng,
      fromCbdHub[0],
      fromCbdHub[1]
    );
    const cbdConnector = sliceCorridorBetweenCoords(
      CORRIDOR_WAYPOINTS.cbdLoop,
      fromCbdHub[0],
      fromCbdHub[1],
      toCbdHub[0],
      toCbdHub[1]
    );
    const outboundLeg = sliceCorridorBetweenCoords(
      toCorridor,
      toCbdHub[0],
      toCbdHub[1],
      toStop.lat,
      toStop.lng
    );

    appendWaypoints(path, inboundLeg);
    appendWaypoints(path, cbdConnector);
    appendWaypoints(path, outboundLeg);
  } else if (fromCorridorKey === 'cbd' && toCorridorKey === 'cbd') {
    // Both stops are within CBD: route along the CBD arterial road loop
    const cbdSlice = sliceCorridorBetweenCoords(
      CORRIDOR_WAYPOINTS.cbdLoop,
      fromStop.lat,
      fromStop.lng,
      toStop.lat,
      toStop.lng
    );
    appendWaypoints(path, cbdSlice);
  } else {
    // Same corridor, or one endpoint is in CBD and the other is on an outer corridor
    const activeCorridorKey = fromCorridorKey !== 'cbd' ? fromCorridorKey : toCorridorKey;
    const corridor = getCorridorWaypointsForKey(activeCorridorKey);
    const corridorCbdHub = corridor[0];

    if (fromCorridorKey === 'cbd' && getDistanceMeters(fromStop.lat, fromStop.lng, corridorCbdHub[0], corridorCbdHub[1]) > 80) {
      // First connect from the CBD origin stop along CBD roads to the corridor's CBD terminal
      const cbdApproach = sliceCorridorBetweenCoords(
        CORRIDOR_WAYPOINTS.cbdLoop,
        fromStop.lat,
        fromStop.lng,
        corridorCbdHub[0],
        corridorCbdHub[1]
      );
      appendWaypoints(path, cbdApproach);
    }

    const mainSlice = sliceCorridorBetweenCoords(
      corridor,
      path[path.length - 1][0],
      path[path.length - 1][1],
      toStop.lat,
      toStop.lng
    );
    appendWaypoints(path, mainSlice);

    if (toCorridorKey === 'cbd' && getDistanceMeters(path[path.length - 1][0], path[path.length - 1][1], toStop.lat, toStop.lng) > 80) {
      // Connect from the corridor's CBD terminal along CBD roads to the CBD destination stop
      const cbdExit = sliceCorridorBetweenCoords(
        CORRIDOR_WAYPOINTS.cbdLoop,
        path[path.length - 1][0],
        path[path.length - 1][1],
        toStop.lat,
        toStop.lng
      );
      appendWaypoints(path, cbdExit);
    }
  }

  // Ensure exact destination coordinate is the final point
  const lastPt = path[path.length - 1];
  if (getDistanceMeters(lastPt[0], lastPt[1], toStop.lat, toStop.lng) > 10) {
    path.push([toStop.lat, toStop.lng]);
  } else {
    path[path.length - 1] = [toStop.lat, toStop.lng];
  }
  // Ensure exact origin coordinate is the first point
  path[0] = [fromStop.lat, fromStop.lng];

  // Never allow a 2-point straight-line fallback
  if (path.length < 3) {
    return null;
  }

  // Identify intermediate stops along this road path in order of travel
  const intermediateStops: { stop: TransitStop; distFromStart: number }[] = [];
  TRANSIT_STOPS.forEach((st) => {
    if (st.id === fromStop.id || st.id === toStop.id) return;
    let minDist = Infinity;
    let closestWaypointIdx = 0;
    path.forEach((wpt, wIdx) => {
      const d = getDistanceMeters(wpt[0], wpt[1], st.lat, st.lng);
      if (d < minDist) {
        minDist = d;
        closestWaypointIdx = wIdx;
      }
    });
    if (minDist <= 550) {
      intermediateStops.push({ stop: st, distFromStart: closestWaypointIdx });
    }
  });

  intermediateStops.sort((a, b) => a.distFromStart - b.distFromStart);

  let transferStop: TransitStop | undefined;
  if (needsCbdTransfer) {
    transferStop =
      intermediateStops.find((item) => item.stop.isTerminal)?.stop ||
      TRANSIT_STOPS[0]; // Kencom Terminal CBD hub
    if (!intermediateStops.some((item) => item.stop.id === transferStop!.id)) {
      intermediateStops.splice(Math.floor(intermediateStops.length / 2), 0, {
        stop: transferStop,
        distFromStart: Math.floor(path.length / 2),
      });
    }
  }

  const orderedStops = [fromStop, ...intermediateStops.map((item) => item.stop), toStop];

  // Calculate total route distance in meters
  let totalDistMeters = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistMeters += getDistanceMeters(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
  }

  const durationMinutes = Math.max(8, Math.round((totalDistMeters / 1000) * 2.2 + 4));
  const demoFareKes = Math.min(180, Math.max(50, Math.round(((totalDistMeters / 1000) * 6) / 10) * 10));
  const co2SavedKg = Number(((totalDistMeters / 1000) * (isElectric ? 0.16 : 0.08)).toFixed(1));

  // If a transfer is involved across two outer corridors, identify the connecting route from MOCK_ROUTES
  const connectingRoute = needsCbdTransfer
    ? MOCK_ROUTES.find((r) => r.toStop.id === toStop.id) || MOCK_ROUTES[0]
    : undefined;

  return {
    id: `dyn-route-${fromStop.id}-${toStop.id}`,
    name: `${fromStop.name.split(' ')[0]} ⇄ ${toStop.name.split(' ')[0]} Express`,
    routeCode: `NRB-${fromStop.id.slice(5, 7).toUpperCase()}`,
    saccoId: sacco.id,
    saccoName: sacco.name,
    isElectric,
    fromStop,
    toStop,
    durationMinutes,
    walkMinutes: 3,
    demoFareKes,
    frequencyMinutes: 5,
    co2SavedKg,
    tag: isElectric ? 'Pure Electric' : 'Fastest',
    nextDepartures: ['3 min', '8 min', '15 min'],
    stops: orderedStops,
    waypoints: path,
    transfersCount: needsCbdTransfer ? 1 : 0,
    transferInfo:
      needsCbdTransfer && transferStop && connectingRoute
        ? {
            transferStop,
            nextRouteId: connectingRoute.id,
            nextRouteCode: connectingRoute.routeCode,
            nextSaccoId: connectingRoute.saccoId,
            nextSaccoName: connectingRoute.saccoName,
            notes: `Alight at ${transferStop.name} (${transferStop.area}) and board ${connectingRoute.saccoName} route ${connectingRoute.routeCode} towards ${toStop.name}.`,
          }
        : undefined,
  };
}

