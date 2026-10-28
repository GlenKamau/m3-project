/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Maintainable Nairobi Commuter Guide Content for m3
 * Practical, beginner-friendly public transport guidance for newcomers and visitors.
 * Explicitly separates general commuter advice from operator-specific rules that
 * must be verified locally on the ground.
 */

import { CommuterGuideSection } from '../types/transit';

export const COMMUTER_GUIDE_SECTIONS: CommuterGuideSection[] = [
  {
    id: 'guide-saccos',
    number: 1,
    title: 'Understanding SACCOs and public transport operators',
    summary:
      'How cooperative bus & matatu operators organize routes, fleets, and electric transit corridors across Nairobi.',
    generalGuidance: [
      'In Kenya, public Service Vehicles (PSVs)—including city buses, electric shuttles, and minibuses (matatus)—are required to operate under registered transport cooperatives known as SACCOs (Savings and Credit Cooperative Organizations) or licensed transport companies.',
      'Each SACCO manages specific corridors (for example, Waiyaki Way, Thika Superhighway, Ngong Road, or Mombasa Road) and sets its own fleet standards, stage marshals, and customer care contacts.',
      'Electric bus operators (such as BasiGo-powered fleets and Super Metro electric buses) run alongside conventional diesel buses on major arterial routes.',
      'Look for the SACCO name printed clearly along the vehicle body or front windscreen header before boarding.',
    ],
    verifyLocallyNote:
      'Fleet schedules, operating hours, and specific vehicle amenities vary by SACCO and time of day. Always confirm the operator name on the vehicle and check with stage marshals locally.',
  },
  {
    id: 'guide-stages',
    number: 2,
    title: 'Finding the correct boarding stage',
    summary:
      'Navigating CBD terminals (Kencom, Ambassadeur, Odeon, Railways) and neighborhood stages.',
    generalGuidance: [
      'Nairobi public transport radiates outward from the Central Business District (CBD). Different SACCOs and corridors use distinct CBD terminals:',
      '• Kencom & City Hall Way: Primarily serves Waiyaki Way (Westlands, Kangemi, Uthiru, Kikuyu) and selected Ngong/Airport lines.',
      '• Ambassadeur / Moi Avenue: Common hub for Ngong Road (Upper Hill, Yaya, Karen) and South B / Eastlands connections.',
      '• Odeon & Tom Mboya Street: Major boarding zone for Thika Superhighway (Pangani, Roysambu TRM, Kasarani, Ruiru).',
      '• Nairobi Central Railway Station: Major hub for Mombasa Road, Industrial Area, and JKIA Airport corridors.',
      'At organized SACCO stages, passengers queue in designated lines overseen by uniformed stage marshals.',
    ],
    verifyLocallyNote:
      'County traffic reorganizations or roadworks can temporarily relocate CBD boarding bays. Verify the active bay with a uniformed SACCO stage attendant before queuing.',
  },
  {
    id: 'guide-routes-signs',
    number: 3,
    title: 'Understanding routes and destination signs',
    summary:
      'How route numbers, corridor codes, and placards indicate where a bus is heading and whether it runs express.',
    generalGuidance: [
      'Many Nairobi routes follow historical route numbers (e.g., 105 for Waiyaki Way/Kikuyu, 111 for Ngong Road/Karen, 44/237 for Thika Road) alongside modern SACCO corridor codes (such as E-105 or SM-44 in this demo).',
      'Buses display a placard on the dashboard, roof rack, or side window listing the final destination and major intermediate stages.',
      '"Express" placards usually indicate that a bus uses the Nairobi Expressway or skips minor roadside stops until a major interchange (such as Westlands or Roysambu).',
      'Before stepping onto the bus, verbally confirm your exact stop with the conductor or marshal—especially when two routes share the same highway before branching off.',
    ],
    verifyLocallyNote:
      'Route codes shown in m3 include simulated prototype identifiers alongside real Nairobi corridors. Always read the physical placard on the bus and ask the crew to confirm it stops at your stage.',
  },
  {
    id: 'guide-terminology',
    number: 4,
    title: 'Common public transport terminology',
    summary:
      'Essential Kenyan and Nairobi commuter terms you will hear at stages and onboard buses.',
    generalGuidance: [
      'Familiarizing yourself with everyday Kenyan transit terms makes asking for directions and communicating with bus crews much easier:',
    ],
    terms: [
      {
        term: 'Stage / Terminal',
        meaning: 'A designated bus or matatu stop where vehicles pick up and drop off commuters.',
      },
      {
        term: 'SACCO',
        meaning: 'The registered transport cooperative or company operating a group of buses.',
      },
      {
        term: 'Makanga / Conductor / Tout',
        meaning: 'The crew member who manages boarding, collects fares, and announces upcoming stages.',
      },
      {
        term: 'Shukisha / Shuka',
        meaning: 'Kiswahili for "Drop me off" / "Alight"—used to let the conductor know your stop is next.',
      },
      {
        term: 'Tao / Town',
        meaning: 'Common local shorthand for Nairobi Central Business District (CBD).',
      },
      {
        term: 'Squad / Express',
        meaning: 'A direct trip that bypasses intermediate stages during peak hours.',
      },
    ],
    verifyLocallyNote:
      'Spoken terms can vary between English, Kiswahili, and Sheng (Nairobi urban slang). Polite English or Kiswahili is understood by all stage marshals and conductors.',
  },
  {
    id: 'guide-payments-fares',
    number: 5,
    title: 'Payment methods and fare information',
    summary:
      'How M-Pesa mobile money, cash, and off-peak vs. peak-hour fares work in practice.',
    generalGuidance: [
      'Fares in Nairobi are not unified under a single city-wide tariff; each SACCO sets fares based on distance, time of day (peak vs. off-peak), and weather or traffic conditions.',
      'Mobile Money (M-Pesa): Widely accepted via Lipa na M-Pesa (Till Number or Paybill) or Pochi la Biashara displayed inside the bus. Always verify the recipient name with the conductor before sending payment.',
      'Cash: Carrying small-denomination Kenyan Shilling notes (KES 50, 100, 200) is recommended in case mobile network coverage is slow or a conductor prefers cash.',
      'Ask for the current fare at the stage before boarding so there are no surprises mid-journey.',
    ],
    verifyLocallyNote:
      'All fares, QR passes, and M-Pesa references inside m3 are simulated prototype estimates. In real travel, confirm the accepted payment method (M-Pesa Till/Paybill vs. Cash) and exact fare directly with the conductor before boarding.',
  },
  {
    id: 'guide-etiquette-safety',
    number: 6,
    title: 'General commuter etiquette and safety',
    summary:
      'Practical tips for queuing, keeping valuables secure, and traveling comfortably.',
    generalGuidance: [
      'Queue patiently at organized SACCO stages; pushing ahead is discouraged and marshals board passengers in line order.',
      'Keep phones, wallets, and passports in zipped front pockets or secure bags, particularly in crowded CBD terminals and when windows are open in slow traffic.',
      'Avoid boarding unmarked vehicles or buses that do not display clear SACCO branding and route placards.',
      'When traveling after dark, prefer well-lit main CBD terminals and established SACCO fleets rather than isolated roadside stops.',
      'By law, public service vehicles have fixed seating capacity—wait for the next bus if a vehicle is already full.',
    ],
    verifyLocallyNote:
      'General etiquette tips are advisory only and do not constitute a safety guarantee. Stay aware of your surroundings and consult local accommodation hosts or official advisories for current area guidance.',
  },
  {
    id: 'guide-missed-stop-transfers',
    number: 7,
    title: 'What to do when a stop is missed or a transfer is needed',
    summary:
      'How to alert the conductor early, handle a missed stage safely, and connect through CBD hubs.',
    generalGuidance: [
      'Alert the conductor one stop before your destination by saying "Shukisha [Stage Name]" or stepping near the door as the bus slows down.',
      'If you miss your stop: Stay calm and inform the conductor immediately. Ask to alight at the next safe, designated stage rather than in moving traffic.',
      'From the next stage, you can either walk back along a pedestrian walkway if close, or cross to the opposite roadside stage to take a return bus.',
      'How transfers work: Most cross-city trips connect in the CBD. If traveling from Westlands to Karen or JKIA, alight at the CBD terminal (e.g., Kencom) and walk a short distance to the connecting SACCO terminal (e.g., Ambassadeur or Railways).',
    ],
    verifyLocallyNote:
      'Never attempt to exit a moving vehicle or cross multi-lane highways (such as Waiyaki Way or Thika Superhighway) except at designated pedestrian footbridges.',
  },
  {
    id: 'guide-using-m3',
    number: 8,
    title: "How to use m3's destination search and journey planner",
    summary:
      'Getting the most out of m3 route comparisons, step-by-step directions, saved places, and demo trip tracking.',
    generalGuidance: [
      '1. Search & Saved Places: Use the "Where to?" bar on Home or the Origin/Destination inputs on Activity. Save frequent stops (Home, Work, Airport) for one-tap selection.',
      '2. Operator Filtering: Filter by a specific SACCO or toggle "e-Bus Only" to view zero-emission electric routes. Mark your favorite operators in Account -> Preferred SACCOs.',
      '3. Step-by-Step Directions: Tap any suggested route in Activity to inspect the boarding stage, ordered intermediate stops, transfer instructions, and road-following map polyline.',
      '4. Prototype Trip History: Save a route as "Planned", start a simulated journey ("In progress"), or repeat a past trip from Activity -> Past Trips without losing your coordinate accuracy.',
    ],
    verifyLocallyNote:
      'm3 is an interactive transit prototype. Live bus markers, ETAs, fares, and boarding passes are simulated for demonstration and must not be treated as verified real-time telemetry.',
  },
];
