# 12 MVP - Persian RTL Quiz Application

A modern Persian (Farsi) quiz game application built with **React Native + Expo**, TypeScript, and Convex backend, featuring cross-platform support (Web, iOS, Android), RTL support, real-time multiplayer matches, and a comprehensive admin panel.

## 🚀 **NEW: Now Available on Mobile!**

This app has been converted to **React Native** and now runs on:
- 🌐 **Web** - React Native Web
- 📱 **iOS** - Native iOS app
- 🤖 **Android** - Native Android app

**One codebase, three platforms, exact same design!**

---


## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Getting Started](#-getting-started)
- [Documentation Structure](#-documentation-structure)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🎮 Quiz & Matchmaking
- **Real-time Multiplayer**: 1v1 quiz matches with automatic matchmaking
- **Tournaments**: 4-player tournaments with semi-finals and finals
- **Question Categories**: Admin-managed categories for organizing questions
- **Question Bank**: Admin-managed questions with categories and difficulty levels
- **Match History**: Complete history of played matches with detailed results
- **Tournament History**: View past tournaments and results
- **Live Scoring**: Real-time score calculation and winner determination

### 🔐 Authentication & Users
- **Email/Password Auth**: Secure authentication with password validation
- **User Profiles**: Customizable user profiles with display names
- **Admin Panel**: Comprehensive admin dashboard for system management
- **Role-based Access**: Admin and user role separation

### ⚙️ Admin Features
- **User Management**: View, edit, and manage user accounts
- **Question Management**: Create, edit, delete quiz questions
- **Category Management**: Create and manage question categories
- **File Management**: Upload and manage media files
- **Match Monitoring**: View and manage all matches in the system
- **Tournament Monitoring**: View and manage all tournaments

### 🎨 UI/UX
- **Persian Language**: Full RTL (Right-to-Left) support
- **Dark Theme**: Custom dark blue and orange color scheme
- **Responsive Design**: Mobile-first responsive layout
- **Toast Notifications**: Persian notification system for user feedback
- **Loading States**: Enhanced loading indicators with skeleton screens
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- **Code Splitting**: Route-based lazy loading for faster initial loads

## 🛠️ Technology Stack

### Frontend (Web + Mobile)
- **React 18.3** - UI library
- **React Native** - Mobile framework
- **Expo 52** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native
- **React Native Web** - Web support

### Backend
- **Convex** - Real-time database and backend
- **Convex Auth** - Authentication system
- **TypeScript** - Type-safe backend code

### Design
- **Vazirmatn Font** - Persian-optimized typography
- **Custom Design System** - Consistent colors and spacing
- **RTL-first Layout** - Optimized for Persian users
- **Cross-Platform UI** - Unified design for web, iOS, and Android

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- For iOS development: Mac with Xcode
- For Android development: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 12mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Download Vazirmatn Fonts**
   - Download from: https://github.com/rastikerdar/vazirmatn/releases/latest
   - Extract the ZIP file
   - Place these 4 files in `assets/fonts/`:
     - Vazirmatn-Regular.ttf
     - Vazirmatn-Medium.ttf
     - Vazirmatn-SemiBold.ttf
     - Vazirmatn-Bold.ttf
   
   **Verify fonts:**
   ```bash
   ls -la assets/fonts/*.ttf
   # Should show 4 .ttf files
   ```

4. **Setup Environment**
   ```bash
   # Create .env file
   cp .env.example .env
   ```
   
   **Add your Convex configuration:**
   ```env
   # Backend deployment
   CONVEX_DEPLOYMENT=dev:precious-horse-758
   
   # Client-side Convex URL (accessible from web/iOS/Android)
   EXPO_PUBLIC_CONVEX_URL=https://precious-horse-758.convex.cloud
   
   # Site URL for callbacks
   CONVEX_SITE_URL=http://localhost:8081
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```
   This command starts both:
   - Mobile/Web App (Expo): http://localhost:8081
   - Backend (Convex): Real-time sync

### Available Scripts

```bash
# Development
npm start            # Start Expo development server
npm run dev          # Start app & Convex backend
npm run dev:app      # Start only Expo
npm run dev:backend  # Start only Convex

# Platform-specific
npm run web          # Run on web browser
npm run ios          # Run on iOS simulator (Mac only)
npm run android      # Run on Android emulator

# Production
npm run build:web    # Build for web
npm run build:vercel # Build for Vercel (web-optimized)
npm run build:ios    # Build for iOS (requires EAS)
npm run build:android # Build for Android (requires EAS)
npm run lint         # Run TypeScript checks
```

### Running on Different Platforms

**Web:**
```bash
npm run web
# Opens at http://localhost:8081
```

**iOS (Mac only):**
```bash
npm run ios
# Requires Xcode and iOS simulator
```

**Android:**
```bash
npm run android
# Requires Android Studio and emulator/device
```

**Physical Devices:**
1. Install Expo Go app on your device
2. Run `npm start`
3. Scan QR code with camera (iOS) or Expo Go (Android)

## 📚 Documentation Structure

This project follows a clear documentation pattern. All documentation is organized into specific files:

### Core Documentation Files

| File | Purpose | Content |
|------|---------|---------|
| **[README.md](./README.md)** | Main documentation | Overview, features, getting started |
| **[DESIGN.md](./DESIGN.md)** | Design system | Colors, typography, components, guidelines |
| **[STRUCTURE.md](./STRUCTURE.md)** | Architecture | Frontend/backend structure, patterns, conventions |

### Documentation Guidelines

**When adding new documentation:**

1. **General info & features** → Add to `README.md`
2. **Design & styling** → Add to `DESIGN.md`
3. **Architecture & code structure** → Add to `STRUCTURE.md`

**Keep documentation:**
- ✅ Up to date with code changes
- ✅ In the correct file based on content type
- ✅ Clear and concise with examples
- ✅ In Persian for user-facing content, English for technical docs

## 📁 Project Structure

### Quick Overview

```
12mvp/
├── app/                   # Expo Router file-based routing
│   ├── _layout.tsx       # Root layout with Convex provider
│   ├── (auth)/           # Authentication routes
│   │   ├── login.tsx
│   │   └── profile-setup.tsx
│   ├── (tabs)/           # Tab navigation group
│   │   ├── index.tsx     # Dashboard
│   │   ├── new-match.tsx # Match lobby
│   │   ├── tournaments.tsx # Tournament lobby
│   │   ├── history.tsx   # Match history
│   │   ├── play.tsx      # Active game screen
│   │   └── results/     # Match results
│   ├── tournament/[id].tsx # Tournament detail
│   └── admin.tsx         # Admin panel
│
├── src/                  # Shared frontend code (web + mobile)
│   ├── features/         # Feature modules (auth, game, admin)
│   │   ├── auth/        # Authentication components
│   │   ├── game/        # Game components (matches, tournaments)
│   │   └── admin/       # Admin components
│   ├── components/      # Shared components
│   │   ├── ui/         # UI components (Button, Modal, etc.)
│   │   ├── match/      # Match-specific components
│   │   └── layout/     # Layout components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and constants
│
├── convex/              # Backend (Convex)
│   ├── schema.ts       # Database schema
│   ├── auth.ts        # Authentication
│   ├── questions.ts   # Questions API
│   ├── categories.ts  # Categories API
│   ├── matchCore.ts   # Core match operations
│   ├── matchGameplay.ts # Gameplay logic
│   ├── matchResults.ts # Match results & history
│   ├── matchAdmin.ts  # Match admin operations
│   ├── tournaments.ts # Tournament barrel export
│   ├── tournamentCore.ts # Core tournament operations
│   ├── tournamentResults.ts # Tournament results
│   ├── tournamentAdmin.ts  # Tournament admin
│   └── files.ts       # File management
│
├── assets/             # Static assets (fonts, images)
└── [README.md, DESIGN.md, STRUCTURE.md] # Documentation
```

**For detailed architecture**, see **[STRUCTURE.md](./STRUCTURE.md)**

### Recent Improvements ✨

**Performance & UX Enhancements (Oct 2025):**
- ✅ **Code Splitting**: Route-based lazy loading for optimal bundle sizes
- ✅ **Error Boundaries**: Added React error boundaries for graceful error handling
- ✅ **Loading States**: Enhanced loading indicators with contextual messages
- ✅ **Skeleton Screens**: Added skeleton components for better perceived performance
- ✅ **Page Loader**: Created centralized loading component with custom messages
- ✅ **Form Loading**: Added visual loading indicators to all form submissions
- ✅ **Error UI**: User-friendly error fallbacks with retry functionality
- ✅ **Lazy Loading**: React.lazy() and Suspense for on-demand component loading

**Refactored Architecture (Oct 2025):**
- ✅ Split large backend files into focused modules
- ✅ Created 8+ reusable UI components (DataTable, Modal, Badge, etc.)
- ✅ Added 4 layout components (PageContainer, PageHeader, TabNavigation, Section)
- ✅ Built comprehensive utility library (validation, formatting, storage, helpers)
- ✅ Extracted game state logic to custom hooks
- ✅ Refactored HomePage (31% code reduction - 307 → 211 lines)
- ✅ Improved code organization and maintainability
- ✅ Reduced code duplication across the entire codebase
- ✅ Added 40+ utility functions for common tasks

See [STRUCTURE.md - Refactoring Benefits](./STRUCTURE.md#-refactoring-benefits) for details.

## 🚀 Deployment

This project is connected to Convex deployment: [`precious-horse-758`](https://dashboard.convex.dev/d/precious-horse-758)

### Vercel Deployment (Web)

The project is configured for **Vercel** deployment with optimized web-only builds:

**Build Configuration:**
- **Build Command**: `npm run build:vercel` (uses `expo export`)
- **Output Directory**: `dist`
- **Framework**: None (custom Expo web build)
- **SPA Routing**: All routes rewrite to `/index.html` for client-side routing

**Vercel-Specific Optimizations:**
- ✅ **Conditional Platform Config**: iOS/Android configs excluded on Vercel builds
  - `app.config.js` detects `VERCEL=1` environment variable
  - Only web configuration included for faster builds
  - Reduces build time and bundle size
- ✅ **Vercel Speed Insights**: Integrated for performance monitoring
  - Automatically loads on web platform only
  - Provides real-time performance metrics
- ✅ **SPA Routing**: Configured in `vercel.json` for Expo Router compatibility

**Vercel Environment Variables:**
```env
EXPO_PUBLIC_CONVEX_URL=https://precious-horse-758.convex.cloud
VERCEL=1  # Automatically set by Vercel
```

**Deploy to Vercel:**
1. Connect your repository to Vercel
2. Vercel will auto-detect `vercel.json` configuration
3. Set `EXPO_PUBLIC_CONVEX_URL` in Vercel environment variables
4. Deploy automatically on every push to main branch

**Files:**
- `vercel.json` - Vercel build configuration
- `app.config.js` - Conditional platform config (excludes iOS/Android on Vercel)
- `.vercelignore` - Files to exclude from deployment

### Production Deployment (General)

1. **Deploy Backend (Convex)**
   ```bash
   npx convex deploy
   ```

2. **Build for Web**
   ```bash
   npm run build:web    # Standard web build
   npm run build:vercel # Vercel-optimized build
   ```

3. **Build for Mobile** (requires EAS)
   ```bash
   npm run build:ios      # iOS build
   npm run build:android  # Android build
   ```

4. **Environment Variables**
   - `EXPO_PUBLIC_CONVEX_URL` - Convex deployment URL (required)
   - `CONVEX_DEPLOYMENT` - Convex deployment ID (for local dev)
   - `CONVEX_SITE_URL` - Site URL for callbacks (for local dev)

### Deployment Checklist
- [ ] Test RTL functionality in production
- [ ] Verify Persian font loading
- [ ] Check real-time features work
- [ ] Ensure admin panel is accessible
- [ ] Test authentication flow
- [ ] Verify Vercel Speed Insights is working (web only)
- [ ] Test SPA routing on all routes

## 🧪 Testing & Troubleshooting

### Quick Testing Checklist

**Authentication:**
- [ ] Can sign up with new account
- [ ] Password validation shows errors
- [ ] Can sign in with existing account
- [ ] Profile setup works
- [ ] Can sign out

**Game Flow:**
- [ ] Dashboard loads and shows user name
- [ ] Can navigate between tabs
- [ ] Can start new match (1v1)
- [ ] Can create/join tournaments (4 players)
- [ ] Waiting screen appears for matches
- [ ] Tournament lobby shows available tournaments
- [ ] Questions display correctly with timer
- [ ] Can select and submit answers
- [ ] Results display correctly
- [ ] Match history shows completed matches
- [ ] Tournament results show bracket and winner

**UI/UX:**
- [ ] Text aligns right (RTL)
- [ ] Persian fonts display correctly
- [ ] Colors match design (#06202F background, #ff701a accent)
- [ ] Toast notifications appear
- [ ] Buttons respond to clicks/taps
- [ ] Loading spinners show

### Common Issues

**Fonts not loading?**
```bash
# Check fonts exist
ls -la assets/fonts/*.ttf
# Should show 4 .ttf files

# If missing, download from:
# https://github.com/rastikerdar/vazirmatn/releases/latest
```

**Convex not connected?**
```bash
# Check .env file
cat .env
# Should show EXPO_PUBLIC_CONVEX_URL

# Start backend separately
npm run dev:backend
```

**Metro bundler error?**
```bash
# Clear cache and restart
npx expo start -c
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 🌐 Internationalization

- **Language**: Persian (Farsi) - `fa-IR`
- **Text Direction**: RTL (Right-to-Left)
- **Font**: Vazirmatn for optimal Persian rendering
- **Date Format**: Persian calendar support

## 🔒 Security

- **Password Validation**: Enforced strong password requirements
- **Role-Based Access**: Admin operations protected
- **Answer Security**: Quiz answers stored separately and securely
- **Input Validation**: Both client and server-side validation

## 📱 Platform Support

### Web
- **Modern browsers** with ES2020+ support
- **Mobile browsers** with touch support
- **RTL support** required

### Mobile
- **iOS**: iOS 13.0 and above
- **Android**: Android 5.0 (API 21) and above
- **React Native**: 0.76.5
- **Expo SDK**: 52.0

## ⚡ Performance

- **Code Splitting**: Routes are lazy-loaded to reduce initial bundle size
- **Optimized Loading**: Only load code needed for current page
- **Fast Initial Load**: Smaller JavaScript bundles for faster startup
- **Suspense Boundaries**: Smooth loading transitions between routes

## 🤝 Contributing

### Code Style
1. Follow the established design system (see **[DESIGN.md](./DESIGN.md)**)
2. Maintain RTL support in all components
3. Use Persian translations for user-facing text
4. Follow the feature-based architecture (see **[STRUCTURE.md](./STRUCTURE.md)**)

### Pull Request Process
1. Update documentation if adding features
2. Ensure all tests pass (`npm run lint`)
3. Follow the project's code organization
4. Test with Persian content

### Adding New Features
1. Create feature module in `src/features/[feature-name]/`
2. Add documentation to appropriate file (README/DESIGN/STRUCTURE)
3. Follow existing patterns and conventions
4. Update this README if adding user-facing features

## 📖 External Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Vazirmatn Font](https://github.com/rastikerdar/vazirmatn)

## 📄 License

This project is for educational/MVP purposes.

---

## 📞 Support

For questions or issues:
- Check **[STRUCTURE.md](./STRUCTURE.md)** for architecture details
- Check **[DESIGN.md](./DESIGN.md)** for styling guidelines
- Review code examples in the documentation

---

## 📊 Project Status

### ✅ Completed (100%)

**React Native Conversion:**
- ✅ All 40+ components converted to React Native
- ✅ Expo 52 + React Native 0.76 setup complete
- ✅ NativeWind (Tailwind for RN) working
- ✅ Expo Router file-based navigation
- ✅ Full authentication system
- ✅ Complete game features (quiz, matches, history)
- ✅ Admin panel (web-optimized)
- ✅ Toast notifications
- ✅ RTL support configured
- ✅ TypeScript properly configured

**Platforms Supported:**
- 🌐 Web (React Native Web)
- 📱 iOS (Native)
- 🤖 Android (Native)

**Documentation:**
- ✅ README.md - Complete setup and features guide
- ✅ DESIGN.md - Full design system with React Native patterns
- ✅ STRUCTURE.md - Complete architecture documentation

### 🚀 Ready to Run!

The project is **production-ready** and fully functional on all platforms!

---

**Made with ❤️ for Persian users**
