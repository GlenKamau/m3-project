---
name: Nairobi Electric Transit
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#45464e'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#505e83'
  primary: '#00020a'
  on-primary: '#ffffff'
  primary-container: '#0b1b3d'
  on-primary-container: '#7684ac'
  inverse-primary: '#b7c6f1'
  secondary: '#006d43'
  on-secondary: '#ffffff'
  secondary-container: '#56fbab'
  on-secondary-container: '#007146'
  tertiary: '#000208'
  on-tertiary: '#ffffff'
  tertiary-container: '#161d28'
  on-tertiary-container: '#7e8593'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b7c6f1'
  on-primary-fixed: '#0a1a3c'
  on-primary-fixed-variant: '#38466a'
  secondary-fixed: '#59fead'
  secondary-fixed-dim: '#31e193'
  on-secondary-fixed: '#002111'
  on-secondary-fixed-variant: '#005231'
  tertiary-fixed: '#dce2f3'
  tertiary-fixed-dim: '#c0c7d6'
  on-tertiary-fixed: '#151c27'
  on-tertiary-fixed-variant: '#404754'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  tabular-time:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a next-generation electric public transit experience for Nairobi. Built on the principles of hyper-legibility, operational clarity, and modern mobility, the aesthetic marries utilitarian transport engineering with a refined, tactile consumer interface. 

The visual language draws inspiration from high-efficiency mobility ecosystems—blending stark functional minimalism with dynamic real-time status cues. It rejects unnecessary skeuomorphism in favor of clear information architecture, crisp geometry, and confident visual contrast designed to remain effortlessly readable whether viewed under midday equatorial sunlight along Uhuru Highway or in low-light transit terminals.

The emotional baseline is dependable, crisp, and sustainable. Interfaces feel snappy and authoritative, projecting the punctuality of high-capacity electric bus and rail networks while instilling immediate spatial confidence for commuters on the move.

## Colors

The palette relies on deliberate contrast between structural transit midnight tones and energetic status signals:

- **Primary (`#0B1B3D`)**: Deep Midnight Navy acts as the anchor for primary navigation headers, critical action buttons, top-level routes, and commanding wayfinding markers.
- **Secondary / Accent (`#00D084`)**: Electric Emerald Green is reserved exclusively for live dynamic states: active electric fleet badges, real-time arrivals, live battery/charge metrics, on-time indicators, and vehicle location beacons. It must never be diluted with non-critical decorative use.
- **Tertiary / Metadata Slate (`#6B7280`)**: Guides secondary metadata such as stop counts, platform IDs, walk times, and intermediate line transfer details.
- **High-Contrast Text / Neutral (`#111827`)**: Deep Charcoal ensures maximum legibility for stop names, pricing, and tabular departure times across light surfaces.
- **Surfaces**: Pure White (`#FFFFFF`) forms the core of floating operational sheets, departure cards, and interactive modal overlays, sitting atop a clean, glare-reducing Soft Canvas Gray (`#F6F8FA`).
- **Hairline Dividers**: Micro-borders using `#E5E7EB` delineate dense list items and route segments without breaking scanning continuity.

## Typography

Typography is calibrated for instantaneous readability on shaking, high-motion public journeys.

- **Headlines (`Plus Jakarta Sans`)**: Delivers geometric clarity and structural presence to terminal stations, major destinations, and screen headers. Its bold weights provide sharp, modern signage aesthetics.
- **Body & Labels (`Inter`)**: Neutral, systematically neutral, and optimized for micro-interfaces. All numeric schedules, departure count-downs, vehicle numbers, and fares must enforce tabular figures (`font-variant-numeric: tabular-nums`) to prevent optical jitter during live real-time countdown updates.
- **Transit Badges (`label-sm`)**: Uppercase, tracked slightly wider (+0.04em) at bold weight for quick differentiation of line codes (e.g., `E-BRT 1`, `L-04`).

## Layout & Spacing

The layout is built around a contextual map canvas and responsive bottom-anchored transit sheets. 

- **Mobile Viewport (up to 640px)**: 4-column layout utilizing a persistent full-viewport map base overlaid with sliding gesture-driven sheets. The screen margins sit at `1rem` (`16px`) with `0.5rem` (`8px`) vertical intervals between dense schedule nodes. Safe zones account for device nav bars and notch regions.
- **Tablet / Split Viewport (641px - 1024px)**: 8-column layout. Bottom sheets morph into a floating side panel anchored to the left viewport, spanning 380px fixed width with `gutter-tablet` spacing, preserving unimpeded map interaction on the right.
- **Desktop / Dashboard (1025px+)**: 12-column layout. Left route-planning panel (4 columns), central operational map tracking layer (8 columns), and an optional collapsible telemetry/fleet status inspector on the right.

Component spacing strictly obeys an 8pt spatial grid, relying on `space-xs` (4px) for inline status tags, `space-sm` (8px) for list element separation, and `space-md` (16px) for interior card padding.

## Elevation & Depth

Visual hierarchy is communicated through floating physical surfaces layered directly over the cartographic canvas, minimizing heavy drop shadows in favor of precise diffuse depth:

- **Base Layer (Elevation 0)**: Interactive map vector layer, satellite views, or clean `#F6F8FA` background surfaces.
- **Map Overlays & Waypoints (Elevation 1)**: Floating map tools (re-center, zoom, transit filters) and static stop markers. Framed with a 1px hairline border (`#E5E7EB`) and a subtle ambient drop shadow: `0 2px 8px rgba(11, 27, 61, 0.06)`.
- **Floating Cards & Bottom Sheets (Elevation 2)**: Core interaction surfaces, active route options, and vehicle cards. Rendered in Pure White (`#FFFFFF`), bounded by a subtle outline (`#F0F2F5`), and elevated using an extended soft-blur shadow: `0 4px 20px rgba(0, 0, 0, 0.08)`.
- **Modals, Real-Time Alerts & Wayfinding Banners (Elevation 3)**: Disruption notices, QR boarding passes, and urgent vehicle approach sheets. Elevated with `0 12px 32px rgba(11, 27, 61, 0.14)` for definitive focus separation.

## Shapes

The design system implements a soft pill-and-capsule geometry inspired by modern mobility systems.

- **Buttons & Live Badges**: Full pill shape (`border-radius: 9999px` / `1rem+`) for primary touch targets, vehicle line markers, and status chips, ensuring tactile thumb targets.
- **Route Cards & Floating Sheets**: Generously rounded corners (`rounded-lg` at 1rem / 16px to `rounded-xl` at 1.5rem / 24px on upper sheet apexes) establish comfortable, human-centric hardware framing.
- **Map Action Anchors**: Perfectly circular shapes (`width == height`, 50% radius) for single-action map utility buttons and vehicle avatar badges.

## Components

### Buttons
- **Primary Action**: Pill-shaped Deep Midnight Navy (`#0B1B3D`) surface with Pure White (`#FFFFFF`) bold text. Height: 48px or 56px for main calls to action (e.g., "Confirm Electric Ride", "Navigate Station").
- **Secondary / Ghost**: Pure White or Canvas Gray background with a 1px border (`#E5E7EB`), Dark Charcoal (`#111827`) text, shifting to a soft `#F0F2F5` tint on press.
- **Live Action**: Electric Emerald Green (`#00D084`) background with Deep Midnight Navy (`#0B1B3D`) typography, utilized exclusively for critical live moments (e.g., "Board Now", "Track Bus Live").

### Chips & Transit Badges
- **Electric Line Badge**: Compact pill badge featuring a solid Electric Emerald background with high-contrast Midnight Navy text (`label-sm`), paired with a lightning or bus pictogram.
- **Schedule Filter Chips**: White pill container, hairline border (`#E5E7EB`), text in Crisp Slate (`#6B7280`). Active state flips to `#0B1B3D` fill with `#FFFFFF` text.

### Departure Lists & Route Cards
- **Lists**: Clean horizontal rows partitioned by hairline dividers (`#F0F2F5`). Left-aligned destination headers, right-aligned tabular countdown badges (`3 min`, `12 min`).
- **Cards**: White surface (`#FFFFFF`) with 16px–24px rounded corners, enclosed in a subtle `#F0F2F5` border with the 20px diffused elevation shadow. Contains destination, line icon, occupancy meter, and battery reserve percentage.

### Checkboxes, Radios, & Toggles
- **Toggles**: Pill switches with a 24px thumb. Active state switches to `#00D084` track fill.
- **Selection Controls**: Custom circular radio buttons with a 2px Midnight Navy active stroke and an inner filled circle for choosing ticket tiers or payment channels (e.g., M-Pesa, Transit Card).

### Input Fields
- **Search & Stop Lookup**: 48px height, rounded-xl (16px) or pill silhouette. Background `#F6F8FA`, placeholder text in `#6B7280`. On focus, transitions cleanly to Pure White background with a 1.5px `#0B1B3D` border.
- **Leading/Trailing Icons**: Integrated search icon (leading) and dynamic clear or voice prompt button (trailing).

### Real-Time Live Map Overlay Markers
- **Vehicle Beacons**: Circular pulses featuring an Electric Emerald Green dot with an expanding concentric ripple animation representing live GPS synchronization.