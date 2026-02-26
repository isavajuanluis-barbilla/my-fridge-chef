# Chef Aid - Mobile App 📱

A React Native (Expo) mobile app that brings Chef Aid to iOS and Android. Powered by Google Gemini AI.

## Features

| Tab | Feature |
|-----|---------|
| 📸 Fridge Scan | Take a photo of your fridge → AI identifies ingredients → suggests 3 recipes |
| 📝 Recipes | Search any recipe, scaled to your party size |
| 🎲 Chef's Choice | Pick meal type + cuisine + vibe → AI surprises you |
| 🗓️ Planner | Weekly or monthly meal plans with .ics export |
| ⚙️ Settings | Save Gemini API key + serving size |

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go app](https://expo.dev/client) on your phone (iOS or Android)
- A free [Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
cd mobile-app
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

### Running on Simulators

```bash
# iOS Simulator (macOS only)
npx expo start --ios

# Android Emulator
npx expo start --android
```

## Project Structure

```
mobile-app/
├── app/
│   ├── _layout.tsx          # Root navigation
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar config
│       ├── index.tsx        # 📸 Fridge Scan
│       ├── meal-planner.tsx # 📝 Recipe Search
│       ├── chefs-choice.tsx # 🎲 Chef's Choice
│       ├── calendar.tsx     # 🗓️ Meal Planner
│       └── settings.tsx     # ⚙️ Settings
├── components/
│   ├── Button.tsx           # Reusable button
│   └── ResultCard.tsx       # AI response display
├── services/
│   └── geminiService.ts     # Gemini API calls
├── constants/
│   ├── Colors.ts            # Design tokens
│   └── storage.ts           # AsyncStorage helpers
└── app.json                 # Expo config
```

## Tech Stack

- **Framework**: React Native + Expo (~52)
- **Navigation**: Expo Router v4 (file-based)
- **AI**: Google Gemini 2.5 Flash API (REST)
- **Camera**: expo-image-picker + expo-camera
- **Storage**: @react-native-async-storage
- **Calendar Export**: expo-file-system + expo-sharing
- **Icons**: @expo/vector-icons (Ionicons)

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Configuration

In the **Settings** tab:
1. Enter your Gemini API key (stored securely on-device)
2. Set the number of people to cook for (1–10)

All data stays on your device — no backend required!
