# Habitual 📱

A free, open-source habit tracker with a beautiful contribution-style grid. No ads. No paywalls. Yours.

## Features

- **3 habit types**: Yes/No (boolean), Count (e.g. glasses of water), Timer (e.g. reading minutes)
- **Visual history grid**: Configurable 3, 6, or 12 month grid of coloured squares
- **Streaks & Stats**: Current streak, longest streak, 30-day completion rate
- **Categories**: Group habits by category with custom colours
- **Reminders**: Per-habit notifications with custom days and time
- **Dark/Light/System theme**: Follows your device or set manually
- **Tap to complete**: Toggle directly on the grid or from the detail screen
- **No account required**: All data stored locally on your device

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g expo-cli eas-cli
```

### Installation

```bash
# Clone or copy the project folder
cd habitual

# Install dependencies
npm install

# Start the development server
npx expo start
```

Then scan the QR code with the **Expo Go** app on your Android phone.

---

## Running on Your Device

### Option 1: Expo Go (fastest, for testing)

1. Install [Expo Go](https://expo.dev/go) from the Play Store / App Store
2. Run `npx expo start`
3. Scan the QR code

### Option 2: Build an APK (Android, install directly)

```bash
# Set up EAS
eas login
eas build:configure

# Build a local APK (no Play Store needed)
eas build --platform android --profile preview
```

This gives you a downloadable `.apk` you can install directly on your Android phone.

### Option 3: Submit to App Stores

```bash
# Android (Play Store)
eas build --platform android
eas submit --platform android

# iOS (App Store)
eas build --platform ios
eas submit --platform ios
```

---

## Project Structure

```
habitual/
├── app/
│   ├── _layout.tsx          # Tab navigation root
│   ├── index.tsx            # Today screen (home)
│   ├── stats.tsx            # Stats screen
│   ├── settings.tsx         # Settings screen
│   └── habit/
│       └── [id].tsx         # Habit detail screen
├── components/
│   ├── HabitCard.tsx        # Card shown on Today screen
│   ├── HabitGrid.tsx        # The coloured squares grid
│   └── AddHabitModal.tsx    # Add/edit habit modal
├── store/
│   └── index.ts             # Zustand store (all app state)
├── hooks/
│   └── useTheme.ts          # Light/dark theme hook
├── utils/
│   ├── habits.ts            # Streak, completion, date utils
│   └── notifications.ts     # Expo notification helpers
├── types/
│   └── index.ts             # TypeScript types
└── constants/
    └── index.ts             # Colours, icons, defaults
```

---

## Customisation Tips

- **Change accent colour**: Search for `#6C63FF` and replace with your preferred colour
- **Add more icons**: Add Ionicons names to `HABIT_ICONS` in `constants/index.ts`
- **Change default grid weeks**: Edit `DEFAULT_SETTINGS.gridWeeks` in `constants/index.ts`

---

## Adding a Home Screen Widget

React Native doesn't support widgets natively, but you can add them using:
- **Android**: [react-native-android-widget](https://github.com/sAleksovski/react-native-android-widget)
- **iOS**: Use a SwiftUI widget extension via an Expo custom dev client

This is more advanced and would require ejecting from Expo Go to a custom dev build. Worth doing once you're happy with the app!

---

## Tech Stack

| Library | Purpose |
|---|---|
| Expo / React Native | Cross-platform mobile framework |
| expo-router | File-based navigation |
| Zustand | State management |
| AsyncStorage | Local persistent storage |
| date-fns | Date utilities |
| expo-notifications | Reminders |
| expo-haptics | Tactile feedback |

---

## License

MIT — do whatever you like with it!
