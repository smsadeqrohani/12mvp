# 12 MVP - Persian RTL Quiz Application

A modern Persian (Farsi) quiz game application built with React, TypeScript, and Convex backend, featuring RTL support, real-time multiplayer matches, and a comprehensive admin panel.

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
- **Question Bank**: Admin-managed questions with categories and difficulty levels
- **Match History**: Complete history of played matches with detailed results
- **Live Scoring**: Real-time score calculation and winner determination

### 🔐 Authentication & Users
- **Email/Password Auth**: Secure authentication with password validation
- **User Profiles**: Customizable user profiles with display names
- **Admin Panel**: Comprehensive admin dashboard for system management
- **Role-based Access**: Admin and user role separation

### ⚙️ Admin Features
- **User Management**: View, edit, and manage user accounts
- **Question Management**: Create, edit, delete quiz questions
- **File Management**: Upload and manage media files
- **Match Monitoring**: View and manage all matches in the system

### 🎨 UI/UX
- **Persian Language**: Full RTL (Right-to-Left) support
- **Dark Theme**: Custom dark blue and orange color scheme
- **Responsive Design**: Mobile-first responsive layout
- **Toast Notifications**: Persian notification system for user feedback
- **Loading States**: Enhanced loading indicators with skeleton screens
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- **Code Splitting**: Route-based lazy loading for faster initial loads

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

### Backend
- **Convex** - Real-time database and backend
- **Convex Auth** - Authentication system
- **TypeScript** - Type-safe backend code

### Design
- **Vazirmatn Font** - Persian-optimized typography
- **Custom Design System** - Consistent colors and spacing
- **RTL-first Layout** - Optimized for Persian users

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

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

3. **Start development servers**
   ```bash
   npm run dev
   ```
   This command starts both:
   - Frontend (Vite): http://localhost:5173
   - Backend (Convex): Real-time sync

4. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Convex Dashboard**: https://dashboard.convex.dev

### Available Scripts

```bash
npm run dev          # Start frontend & backend
npm run dev:frontend # Start only frontend
npm run dev:backend  # Start only backend (Convex)
npm run build        # Build for production
npm run lint         # Run TypeScript & build checks
```

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
├── src/                    # Frontend application
│   ├── pages/             # Route pages (3 pages)
│   ├── features/          # Feature modules (auth, game, admin)
│   ├── components/        # Shared components
│   │   ├── ui/           # UI components (11 components - NEW!)
│   │   ├── match/        # Match components (3 components)
│   │   └── layout/       # Layout components (4 components)
│   ├── hooks/            # Custom React hooks (2 hooks)
│   └── lib/              # Utilities and constants
│       ├── utils.ts      # Main utilities
│       ├── validation.ts # Validation helpers
│       ├── formatting.ts # Formatting helpers
│       ├── storage.ts    # LocalStorage helpers
│       └── helpers.ts    # General helpers
│
├── convex/                # Backend (Convex)
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Authentication
│   ├── questions.ts      # Questions API
│   ├── matchCore.ts      # Core match operations
│   ├── matchGameplay.ts  # Gameplay logic
│   ├── matchResults.ts   # Results & history
│   ├── matchAdmin.ts     # Admin operations
│   └── files.ts          # File management
│
├── public/               # Static assets
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

### Production Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy to Convex**
   ```bash
   npx convex deploy
   ```

3. **Deploy frontend** to your hosting provider (Vercel, Netlify, etc.)

4. **Environment variables**
   - Set `VITE_CONVEX_URL` in your hosting environment
   - Configure authentication providers if needed

### Deployment Checklist
- [ ] Test RTL functionality in production
- [ ] Verify Persian font loading
- [ ] Check real-time features work
- [ ] Ensure admin panel is accessible
- [ ] Test authentication flow

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

## 📱 Browser Support

- **Modern browsers** with ES2020+ support
- **Mobile browsers** with touch support
- **RTL support** required

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

- [Convex Documentation](https://docs.convex.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vazirmatn Font](https://github.com/rastikerdar/vazirmatn)
- [React Router](https://reactrouter.com/)

## 📄 License

This project is for educational/MVP purposes.

---

## 📞 Support

For questions or issues:
- Check **[STRUCTURE.md](./STRUCTURE.md)** for architecture details
- Check **[DESIGN.md](./DESIGN.md)** for styling guidelines
- Review code examples in the documentation

---

**Made with ❤️ for Persian users**

**Last Updated**: October 9, 2025
