# ItinerAI

An AI-powered travel itinerary planner and smart assistant built with React Native and Google Gemini. Generates personalized, day-by-day travel schedules with real-time weather integration, interactive maps, and offline support.

[![CI](https://github.com/shubhi021/itiner-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/shubhi021/itiner-ai/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-171%20passed%20(22%20suites)-brightgreen.svg)](https://github.com/shubhi021/itiner-ai)
[![React Native](https://img.shields.io/badge/React%20Native-0.73.6-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Storage](https://img.shields.io/badge/Storage-MMKV%20(JSI%2030x%20Faster)-orange.svg)](https://github.com/mrousavy/react-native-mmkv)
[![Security](https://img.shields.io/badge/Security-BFF%20Proxy%20%2B%20BYOK-purple.svg)](#)
[![Engine](https://img.shields.io/badge/Engine-Hermes%20Bytecode-yellow.svg)](#)
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
- **High-Performance MMKV Storage**: Uses C++ JSI synchronous MMKV storage (~30x faster than AsyncStorage) with automated legacy migration and 0ms bridge serialization.
- **Production Security Architecture**: Dual-mode operational architecture featuring a Backend-For-Frontend (BFF) edge proxy isolating master API keys, plus client-side Bring-Your-Own-Key (BYOK) encrypted storage.
- **Hermes Bytecode Engine**: Precompiled bytecode with inline requires delivering sub-400ms cold startup times and a lean 723 KB gzipped bundle.

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
`gemini-3.5-flash-lite` &rarr; `gemini-flash-lite-latest` &rarr; `gemini-flash-latest` &rarr; `gemini-3.6-flash` &rarr; `gemini-3.5-flash` &rarr; `gemini-pro-latest`.

### High-Performance Storage (MMKV JSI)
- **Zero Bridge Latency**: `react-native-mmkv` connects directly to C++ memory mapped files via JavaScript Interface (JSI).
- **Synchronous Hydration**: Eliminates async loading spinners on app cold boot (`storageService.getSavedTripsSync()`).
- **Micro-Benchmark**: On-device 50 IOPS tests prove MMKV is **~30x faster** than legacy AsyncStorage (2ms read vs 61ms).
- **Seamless Migration**: Automatic zero-downtime migration imports existing user trips from AsyncStorage into MMKV on first launch.

### Security Architecture: Backend-For-Frontend (BFF) vs. Client .env
- **The Threat**: Mobile apps embedding `.env` files compile API keys into binary bytecode, making them extractable in seconds via `apktool` or `strings`.
- **The Fix**: A standalone serverless edge microservice (`server/bffProxy.js`) isolates private API credentials on the server, enforcing:
  - HMAC app attestation headers (`X-App-Client-Token`).
  - Sliding-window rate limiting (30 requests/minute per IP).
  - Strict input length sanitization against prompt injection.
  - 1-hour edge caching for weather and identical itineraries.
- **Developer BYOK**: Developers testing the repo can input their personal Gemini API key directly in Profile settings, stored encrypted in local MMKV.

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
├── server/               # Backend-For-Frontend (BFF) Edge Proxy
│   └── bffProxy.js       # Node/Edge server isolating API credentials
├── src/
│   ├── components/       # Reusable UI components (BudgetSelector, InterestChip, MapRoute, etc.)
│   ├── navigation/       # Navigators and route parameter definitions
│   ├── screens/          # Application screens (Plan, Itinerary, Copilot, Insights, Profile)
│   ├── services/         # External integrations & storage
│   │   ├── apiClient.ts               # BFF network client & BYOK resolver
│   │   ├── llmService.ts              # Gemini API client & schemas
│   │   ├── weatherService.ts          # OpenWeatherMap API & weather caching
│   │   ├── storageService.ts          # MMKV JSI synchronous storage layer
│   │   └── placesService.ts           # OpenStreetMap geocoding autocomplete
│   ├── store/            # Redux store and slices
│   ├── theme/            # Color palettes, typography, and spacing
│   ├── types/            # Shared TypeScript definitions
│   └── utils/            # Dimension and formatting helpers
├── __tests__/            # Jest unit and component test suites (22 suites, 171 tests)
├── .github/workflows/    # CI configuration (lint, typecheck, tests, bundle check)
└── package.json
```

---

## Testing & CI

The test suite covers state management, offline storage, API integration, and key UI components using Jest and React Native Testing Library. Continuous integration runs automatically on GitHub Actions for every push and pull request to `main`.

```bash
# Run unit and component tests (171 passing tests)
npm test

# Run tests with code coverage report
npm run test:coverage

# Run TypeScript static type check
npm run typecheck

# Run ESLint validation
npm run lint

# Start the Backend-For-Frontend (BFF) edge proxy
npm run start:bff

# Compile production bundles & sourcemaps
npm run bundle:android
npm run bundle:ios
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
