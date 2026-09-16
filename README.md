# ItinerAI

An AI-powered travel itinerary planner and smart assistant built with React Native and Google Gemini. Generates personalized, day-by-day travel schedules with real-time weather integration, interactive maps, and offline support.

[![CI](https://github.com/shubhi021/itiner-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/shubhi021/itiner-ai/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-7%20passed-brightgreen.svg)](https://github.com/shubhi021/itiner-ai)
[![React Native](https://img.shields.io/badge/React%20Native-0.73.6-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Screenshots

<!-- Add your app screenshots or demo recordings here -->
| Trip Planning | Itinerary Timeline | AI Travel Copilot | Packing & Insights |
| :---: | :---: | :---: | :---: |
| *Add screenshot* | *Add screenshot* | *Add screenshot* | *Add screenshot* |

---

## Overview

Planning a multi-day trip usually means juggling maps, weather apps, travel blogs, and notes across multiple windows. **ItinerAI** consolidates this workflow into a single mobile experience:

- **Structured Day-by-Day Itineraries**: Generates complete daily schedules with activity times, categories, coordinates, and cost estimates.
- **Weather-Aware Planning**: Fetches local forecasts via OpenWeatherMap to adapt recommendations (e.g., suggesting indoor alternatives on rainy days).
- **In-App Travel Copilot**: A conversational assistant grounded in your active trip details (destination, dates, budget tier, and travel style).
- **Prompt-to-Edit Re-Planning**: Modify any day's plan using quick presets (*Relaxed*, *Food Tour*, *Efficient Transit*) or custom natural language instructions.
- **Trip Intelligence**: Generates a weather-adapted packing checklist, cultural etiquette tips, and an itemized budget breakdown.
- **Offline-First Storage**: Saves itineraries, checklists, and notes locally using AsyncStorage so you can access your plans without an internet connection.

---

## How It Works

### Structured Gemini Outputs
Rather than requesting freeform text and relying on regex or markdown parsing, ItinerAI uses Gemini's native `responseSchema` (`SchemaType.OBJECT`, `SchemaType.ARRAY`). This guarantees that API responses strictly adhere to our TypeScript data models, preventing runtime parsing errors.

### Grounded Context Prompts
When interacting with the Copilot or requesting schedule adjustments, the app injects relevant trip context into the system prompt:
- Active destination, dates, and group style (solo, couple, family, friends)
- Current weather conditions and temperature
- Selected budget tier (`low`, `mid`, `high`)
- Scheduled stops from other days to avoid duplicate suggestions

### Multi-Model Fallback Chain
To protect against rate limits or temporary service degradation, API requests automatically cascade through fallback models:
`gemini-1.5-flash` &rarr; `gemini-2.0-flash` &rarr; `gemini-1.5-pro` &rarr; `gemini-flash-latest`.

### Local Caching & Persistence
- Itineraries, saved trips, and packing checklist states are stored locally with `@react-native-async-storage/async-storage`.
- Weather data is cached with a 1-hour TTL to minimize unnecessary API requests.

---

## Features

| Feature | Description |
| :--- | :--- |
| **Itinerary Generator** | Multi-day travel plans with geocoded stops and category tagging. |
| **Travel Copilot** | Chat assistant with quick suggestion chips, grounded in your trip parameters. |
| **Activity Swapping** | Swap any individual activity with context-aware alternatives (indoor, budget, relaxed, foodie). |
| **Day Re-Planner** | Restructure an entire day's schedule via presets or custom text prompts. |
| **Smart Packing List** | Interactive checklist adapted to expected weather and scheduled activities. |
| **Cultural & Practical Guide** | Destination briefings covering tipping norms, local transit, etiquette, and emergency numbers. |
| **Budget Breakdown** | Itemized cost projections with visual category percentage bars. |
| **Interactive Map View** | View daily activity locations plotted on an interactive map. |
| **Saved Trips Library** | Searchable offline trip manager with status tracking (`Upcoming` / `Completed`). |

---

## Tech Stack

- **Framework**: React Native 0.73.6
- **Language**: TypeScript 5.0.4
- **AI Engine**: Google Generative AI SDK (`@google/generative-ai`)
- **State Management**: Redux Toolkit & React-Redux
- **Local Storage**: `@react-native-async-storage/async-storage`
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **Maps**: `react-native-maps`
- **Weather API**: OpenWeatherMap
- **Geocoding**: OpenStreetMap (Nominatim API)

---

## Project Structure

```
ItinerAI/
├── src/
│   ├── components/       # Reusable UI components (BudgetSelector, InterestChip, MapRoute, etc.)
│   ├── navigation/       # Navigators and route parameter definitions
│   ├── screens/          # Application screens
│   │   ├── TripFormScreen.tsx         # Trip configuration & preferences
│   │   ├── ItineraryDetailScreen.tsx  # Interactive daily timeline and map
│   │   ├── TripCopilotScreen.tsx      # Conversational travel assistant
│   │   ├── TripInsightsScreen.tsx     # Packing checklist, culture, and budget
│   │   ├── SavedTripsScreen.tsx       # Offline trip manager and search
│   │   └── ...
│   ├── services/         # External integrations & storage
│   │   ├── llmService.ts              # Gemini API client & schemas
│   │   ├── weatherService.ts          # OpenWeatherMap API & weather caching
│   │   ├── storageService.ts          # AsyncStorage persistence layer
│   │   └── placesService.ts           # OpenStreetMap geocoding autocomplete
│   ├── store/            # Redux store and slices
│   │   ├── itinerarySlice.ts          # Active itinerary and copilot state
│   │   ├── savedTripsSlice.ts         # Saved trips library
│   │   └── tripSlice.ts               # Trip creation form state
│   ├── theme/            # Color palettes, typography, and spacing
│   ├── types/            # Shared TypeScript definitions
│   └── utils/            # Dimension and formatting helpers
├── __tests__/            # Jest unit and component test suites
├── .github/workflows/    # CI configuration (lint, typecheck, tests, bundle check)
└── package.json
```

---

## Testing & CI

The test suite covers state management, offline storage, API integration, and key UI components using Jest and React Native Testing Library. Continuous integration runs automatically on GitHub Actions for every push and pull request to `main`.

```bash
# Run unit and component tests
npm test

# Run tests with code coverage report
npm run test:coverage

# Run TypeScript static type check
npm run typecheck

# Run ESLint validation
npm run lint
```

| Test Suite | Focus Area |
| :--- | :--- |
| `storageService.test.ts` | Local persistence, weather TTL cache expiration, trip hydration |
| `savedTripsSlice.test.ts` | Redux CRUD actions, search filtering, async thunks |
| `itinerarySlice.test.ts` | Schedule modifications, activity updates, packing checklist state |
| `weatherService.test.ts` | Weather response parsing and contextual travel advice |
| `BudgetSelector.test.tsx` | Selection callbacks and accessibility attributes |
| `InterestChip.test.tsx` | Active toggle states and icon rendering |
| `App.test.tsx` | Root component mount and provider hierarchy |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- React Native CLI development setup ([Official Guide](https://reactnative.dev/docs/environment-setup))
- Android Studio (for Android emulator) or Xcode + CocoaPods (for iOS simulator, macOS required)

### 1. Clone & Install

```bash
git clone https://github.com/shubhi021/itiner-ai.git
cd itiner-ai
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
```

- Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
- Get a free weather API key from [OpenWeatherMap](https://openweathermap.org/api).

### 3. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Run the Application

```bash
# Start the Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
