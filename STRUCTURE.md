# 📂 Architecture & Structure Documentation

Complete guide to the project's architecture, file organization, and code patterns for both frontend and backend.

## 📋 Table of Contents

- [Architecture Principles](#-architecture-principles)
- [Frontend Structure](#-frontend-structure)
- [Backend Structure](#-backend-structure)
- [Import Patterns](#-import-patterns)
- [Code Conventions](#-code-conventions)
- [Security Patterns](#-security-patterns)
- [Pagination Patterns](#-pagination-patterns)

## 🎯 Architecture Principles

### Feature-Based Organization
The project follows a **feature-based architecture** where code is organized by business domain rather than technical concerns.

**Benefits:**
- ✅ Makes code easier to find and understand
- ✅ Reduces coupling between features
- ✅ Enables better team collaboration
- ✅ Simplifies testing and maintenance
- ✅ Scales well with project growth

### Separation of Concerns

**Frontend:**
- **Pages** (`src/pages/`) - Top-level route components
- **Features** (`src/features/`) - Self-contained business logic modules
- **Components** (`src/components/`) - Shared, reusable UI components
- **Lib** (`src/lib/`) - Utility functions and helpers

**Backend:**
- **Schema** (`schema.ts`) - Database structure
- **APIs** (`*.ts`) - Feature-specific endpoints
- **Utils** (`utils.ts`) - Shared backend logic

## 📁 Frontend Structure

### Expo Router File-Based Routing

The app uses **Expo Router** for file-based navigation, replacing traditional React Router:

```
app/
├── _layout.tsx                    # Root layout (Convex provider, fonts, RTL)
├── (auth)/                       # 🔐 Authentication group
│   ├── login.tsx                 # Login screen
│   └── profile-setup.tsx         # Profile setup screen
│
├── (tabs)/                       # 📱 Tab navigation group
│   ├── _layout.tsx               # Tab bar configuration
│   ├── index.tsx                 # Dashboard (HelloPage)
│   ├── new-match.tsx             # Match lobby (MatchLobby)
│   ├── tournaments.tsx           # Tournament lobby (TournamentLobby)
│   ├── history.tsx               # Match history (MatchHistory)
│   ├── play.tsx                  # Active game (QuizGame) - hidden tab
│   └── results/
│       └── [id].tsx              # Match results - hidden tab
│
├── tournament/
│   └── [id].tsx                  # Tournament detail view
│
└── admin.tsx                     # Admin panel (admin only)
```

### Shared Code Structure

```
src/
├── features/                      # 🎯 Feature modules
│   │
│   ├── auth/                     # 🔐 Authentication Feature
│   │   ├── index.ts             # Barrel export
│   │   └── components/
│   │       ├── SignInForm.tsx   # Email/password sign-in
│   │       ├── SignUpForm.tsx   # User registration
│   │       ├── SignOutButton.tsx # Logout functionality
│   │       └── ProfileSetup.tsx # User profile creation
│   │
│   ├── game/                     # 🎮 Game/Match Feature
│   │   ├── index.ts             # Barrel export
│   │   └── components/
│   │       ├── QuizGame.tsx     # Quiz gameplay logic with hints system
│   │       ├── MatchLobby.tsx   # Matchmaking & waiting
│   │       ├── MatchResults.tsx # Results display
│   │       ├── MatchHistory.tsx # User match history
│   │       ├── TournamentLobby.tsx # Tournament lobby & creation
│   │       └── HelloPage.tsx    # Dashboard welcome
│   │
│   └── admin/                    # ⚙️ Admin Feature
│       ├── index.ts             # Barrel export
│       └── components/
│           ├── QuestionsForm.tsx # Question CRUD form
│           ├── CategoryForm.tsx  # Category CRUD form
│           ├── FilesTable.tsx    # File management
│           ├── FileUpload.tsx    # File upload component
│           ├── FilePreview.tsx    # File preview modal
│           └── MatchDetailsAdmin.tsx # Match monitoring
│
├── components/                    # 🧩 Shared components
│   ├── ui/                       # Reusable UI components
│   │   ├── index.ts             # Barrel export
│   │   ├── PaginationControls.tsx # Pagination component
│   │   ├── DataTable.tsx       # Generic data table (web)
│   │   ├── DataTableRN.tsx     # React Native data table
│   │   ├── Modal.tsx           # Modal/Dialog component
│   │   ├── Badge.tsx           # Status badges
│   │   ├── Button.tsx          # Button variants
│   │   ├── FormField.tsx       # Form input wrapper
│   │   ├── TextInput.tsx       # Text input component
│   │   ├── LoadingSpinner.tsx  # Loading states
│   │   ├── PageLoader.tsx      # Full page loading
│   │   ├── Skeleton.tsx        # Loading placeholders
│   │   ├── ErrorBoundary.tsx    # Error handling
│   │   ├── KeyboardAvoidingContainer.tsx # Keyboard handling
│   │   └── RTLView.tsx          # RTL wrapper
│   │
│   ├── match/                   # Match-specific shared components
│   │   ├── index.ts            # Barrel export
│   │   ├── WaitingScreen.tsx   # Waiting for opponent screen
│   │   ├── PlayerCard.tsx     # Player display card
│   │   └── MatchStatusBadge.tsx # Match status indicator
│   │
│   └── layout/                  # Layout components
│       ├── index.ts            # Barrel export
│       ├── PageContainer.tsx   # Page wrapper with padding
│       ├── PageHeader.tsx      # Page title/subtitle component
│       ├── TabNavigation.tsx   # Reusable tab navigation
│       └── Section.tsx         # Content section wrapper
│
├── hooks/                        # 🪝 Custom React hooks
│   ├── index.ts                # Barrel export
│   ├── useGameState.ts         # Game state machine hook
│   ├── useMatchStatusMonitor.ts # Match status monitoring
│   └── useResponsive.ts        # Responsive breakpoint hook
│
└── lib/                          # 🔧 Utilities
    ├── utils.ts                 # Main utilities (cn, re-exports)
    ├── constants.ts             # App-wide constants
    ├── validation.ts            # Input validation utilities
    ├── formatting.ts            # Display formatting utilities
    ├── storage.ts               # AsyncStorage utilities
    ├── helpers.ts               # General helper functions
    ├── toast.tsx                # Toast notification config
    ├── rtl.ts                   # RTL utilities
    ├── platform.ts             # Platform detection
    └── filePicker.ts            # File picker utilities
```

### Feature Module Structure

Each feature follows this pattern:

```
features/[feature-name]/
├── index.ts              # Barrel export (public API)
└── components/           # Feature components
    ├── Component1.tsx
    ├── Component2.tsx
    └── ...
```

**Example barrel export** (`features/auth/index.ts`):
```typescript
export { SignInForm } from './components/SignInForm';
export { SignUpForm } from './components/SignUpForm';
export { SignOutButton } from './components/SignOutButton';
export { ProfileSetup } from './components/ProfileSetup';
```

### Route Organization

Routes are defined by **file structure** in `app/` directory:

**Tab Routes** (`app/(tabs)/`):
- `index.tsx` - Dashboard (HelloPage component)
- `new-match.tsx` - Match lobby (MatchLobby component)
- `tournaments.tsx` - Tournament lobby (TournamentLobby component)
- `history.tsx` - Match history (MatchHistory component)
- `play.tsx` - Active game screen (QuizGame component) - Hidden from tab bar
- `results/[id].tsx` - Match results - Hidden from tab bar

**Auth Routes** (`app/(auth)/`):
- `login.tsx` - Authentication flow (SignInForm/SignUpForm)
- `profile-setup.tsx` - Profile setup (ProfileSetup component)

**Other Routes**:
- `admin.tsx` - Admin panel (restricted to admin users)
- `tournament/[id].tsx` - Tournament detail view

Routes are simple wrappers that render feature components and handle navigation/authentication guards.

## 📦 Backend Structure (Convex)

```
convex/
├── schema.ts                       # 📊 Database Schema
│   ├── users & profiles           # User data
│   ├── questions & questionAnswers # Quiz questions (answers secured)
│   ├── files                      # Media files
│   ├── matches & matchParticipants # Game matches
│   └── matchResults               # Match outcomes
│
├── auth.ts                         # 🔐 Authentication API
│   ├── loggedInUser()            # Get current user
│   ├── getUserProfile()          # Get user profile
│   ├── createProfile()           # Create profile
│   ├── getAllUsers() [admin]     # List all users
│   ├── makeUserAdmin() [admin]   # Grant admin access
│   ├── updateUserName() [admin]  # Update user name
│   └── resetUserPassword() [admin] # Reset password
│
├── questions.ts                    # ❓ Questions API
│   ├── getAllQuestions() [admin] # List questions (with answers)
│   ├── createQuestion() [admin]  # Create question
│   ├── updateQuestion() [admin]  # Update question
│   ├── deleteQuestion() [admin]  # Delete question
│   ├── generateUploadUrl() [admin] # Get upload URL
│   └── getQuestionMediaUrl()     # Get media URL
│
├── matches.ts                      # 🎮 Match API (Barrel export)
│   └── Re-exports from specialized modules
│
├── matchCore.ts                    # 🎯 Core Match Operations
│   ├── createMatch()             # Create/join match
│   ├── getMatchDetails()         # Get match info (no answers)
│   ├── getUserActiveMatch()      # Check active match
│   ├── getUserActiveMatchStatus() # Match status
│   ├── leaveMatch()              # Leave match
│   └── Solo waiting window (24h) # Creator can answer while waiting for opponent
│
├── matchGameplay.ts                # 🎲 Gameplay Operations
│   ├── submitAnswer()            # Submit answer (validates)
│   ├── checkMatchCompletion()    # Check if completed (handles tournament progression)
│   ├── disableWrongOptions()     # Disable wrong answer options (costs points)
│   └── showCorrectAnswer()       # Show correct answer (costs 7 points)
│
├── matchResults.ts                 # 🏆 Results & History
│   ├── getMatchResults()         # Get results (with answers)
│   ├── getUserMatchHistory()     # User's match history
│   └── getMatchResultsPartial()  # Partial results
│
├── matchAdmin.ts                   # ⚙️ Admin Match Operations
│   ├── getAllMatches() [admin]   # List all matches
│   └── cancelMatch() [admin]     # Cancel match
│
├── tournaments.ts                  # 🏟️ Tournament API (Barrel export)
│   └── Re-exports from specialized modules
│
├── tournamentCore.ts               # 🎯 Core Tournament Operations
│   ├── createTournament()        # Create tournament
│   ├── joinTournament()          # Join waiting tournament
│   ├── leaveTournament()         # Leave tournament
│   ├── cancelTournament()        # Cancel tournament (creator only)
│   ├── getTournamentDetails()    # Get tournament info
│   ├── getUserActiveTournaments() # Get user's active tournaments
│   ├── getWaitingTournaments()   # Get all waiting tournaments
│   ├── getMyWaitingTournaments()  # Get user's waiting tournaments
│   ├── checkTournamentParticipation() # Check if user is in tournament
│   └── checkTournamentMatch()    # Check user's match in tournament
│
├── tournamentResults.ts            # 🏆 Tournament Results & History
│   ├── getUserTournamentHistory() # User's tournament history
│   └── getTournamentResults()    # Get full tournament results (bracket)
│
├── tournamentAdmin.ts              # ⚙️ Admin Tournament Operations
│   ├── getAllTournaments() [admin] # List all tournaments
│   └── getTournamentDetailsAdmin() [admin] # Get tournament details with all data
│
├── categories.ts                   # 📂 Category Management
│   ├── getCategories()            # List all categories
│   ├── getCategoryWithCount()     # Get category with question count
│   └── createCategory() [admin]   # Create category
│
├── questionCategories.ts           # 🔗 Question-Category Links
│   └── getCategoriesWithCounts() # Get categories with question counts
│
├── files.ts                        # 📁 File Management API
│   ├── getAllFiles() [admin]     # List all files
│   ├── uploadFile() [admin]      # Upload file
│   ├── renameFile() [admin]      # Rename file
│   └── deleteFile() [admin]      # Delete file
│
├── crons.ts                        # ⏰ Scheduled Tasks
│   └── Expiration cleanup cron jobs
│
├── utils.ts                        # 🛠️ Backend Utilities
│   ├── requireAuth()             # Ensure authenticated
│   ├── requireAdmin()            # Ensure admin
│   ├── adminOnly()               # Admin-only wrapper
│   ├── validateQuestion()        # Validate question data
│   ├── getRandomQuestions()      # Get random questions (category support)
│   ├── awardPoints()             # Award points to user
│   └── deductPoints()            # Deduct points from user
│
├── auth.config.ts                  # Auth configuration
├── http.ts                         # HTTP endpoints
└── router.ts                       # API router
```

### Database Schema

**Key tables:**

1. **Users & Profiles**
   - `users` (Convex Auth) - Authentication
   - `profiles` - User profiles, admin status

2. **Categories**
   - `categories` - Question categories

3. **Questions**
   - `questions` - Question data (no answers)
   - `questionAnswers` - Correct answers (secure)
   - `questionCategories` - Question-category links

4. **Matches**
   - `matches` - Match metadata
   - `matchParticipants` - Players & answers
   - `matchResults` - Final results

5. **Tournaments**
   - `tournaments` - Tournament metadata
   - `tournamentParticipants` - Tournament players
   - `tournamentMatches` - Tournament match links (semi-finals, final)

6. **Files**
   - `files` - File metadata
   - `_storage` - Convex storage (media)

### API Security Patterns

**Authentication:**
```typescript
// Require authenticated user
const userId = await requireAuth(ctx);

// Require admin user
await requireAdmin(ctx);

// Admin-only mutation wrapper
export const adminMutation = mutation({
  handler: adminOnly(async (ctx, args) => {
    // Admin logic
  })
});
```

**Answer Security:**
```typescript
// Questions table - NO correct answer
questions: {
  questionText: string,
  option1Text: string,
  // ... options
  // ❌ NO correctOption field
}

// Separate secure table
questionAnswers: {
  questionId: Id<"questions">,
  correctOption: number  // ✅ Only accessible server-side
}
```

## 🚀 Import Patterns

### Barrel Exports

**Why?** Cleaner imports and better public API control.

```typescript
// ❌ Before - Long paths
import { SignInForm } from "../features/auth/components/SignInForm";
import { SignUpForm } from "../features/auth/components/SignUpForm";

// ✅ After - Clean barrel imports
import { SignInForm, SignUpForm } from "../features/auth";
```

### Import Rules

**Routes import from features:**
```typescript
// app/(tabs)/index.tsx
import { HelloPage } from "../../src/features/game";
import { SignOutButton } from "../../src/features/auth";

// app/(tabs)/tournaments.tsx
import { TournamentLobby } from "../../src/features/game";
```

**Features can import from other features:**
```typescript
// features/admin/components/MatchDetailsAdmin.tsx
import { MatchResults } from "../../game";
```

**Shared components:**
```typescript
import { PaginationControls } from "../components/ui";
```

**Backend imports:**
```typescript
// In routes (app/)
import { api } from "../../convex/_generated/api";

// In features/components (src/)
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
```

### Creating Barrel Exports

**Template** (`features/[feature]/index.ts`):
```typescript
// Export all components from this feature
export { Component1 } from './components/Component1';
export { Component2 } from './components/Component2';
// ... more exports
```

## 📝 Code Conventions

### Component Structure

```typescript
// 1. Imports - External first, then internal
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ComponentA } from "../other-feature";

// 2. Types/Interfaces
interface ComponentProps {
  id: string;
  onComplete: () => void;
}

// 3. Component
export function MyComponent({ id, onComplete }: ComponentProps) {
  // 4. Hooks
  const data = useQuery(api.feature.getData, { id });
  const [state, setState] = useState(false);
  
  // 5. Handlers
  const handleClick = () => {
    setState(true);
  };
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### File Naming

- **Components**: PascalCase - `QuizGame.tsx`, `MatchLobby.tsx`
- **Utils**: camelCase - `utils.ts`, `constants.ts`
- **Barrel exports**: `index.ts`
- **Types**: PascalCase - `types.ts` or inline

### State Management

```typescript
// ✅ Local state
const [count, setCount] = useState(0);

// ✅ Server state (Convex real-time)
const matches = useQuery(api.matches.getAllMatches);

// ✅ Form state
const [formData, setFormData] = useState({ name: "" });

// ✅ Custom hooks for complex state
import { useGameState, useMatchStatusMonitor } from "../hooks";

const { gameState, currentMatchId, setToPlaying } = useGameState();
const matchStatus = useMatchStatusMonitor({
  gameState,
  isResetting: false,
  onMatchActive: setToPlaying,
  onMatchWaiting: setToWaiting,
  onMatchCancelled: resetGame,
});
```

### TypeScript Patterns

```typescript
// Use Convex generated types
import { Id } from "../../convex/_generated/dataModel";

// Props interfaces
interface Props {
  matchId: Id<"matches">;
  onComplete: () => void;
}

// Discriminated unions for state
type GameState = "lobby" | "waiting" | "playing" | "results";
```

## 🧩 Shared Components Library

### UI Components (`src/components/ui/`)

**DataTable** - Generic table component for admin panels:
```typescript
<DataTable
  columns={[
    {
      key: "name",
      header: "نام",
      icon: <UserIcon />,
      render: (item) => <span>{item.name}</span>
    }
  ]}
  data={users}
  keyExtractor={(user) => user._id}
  emptyState={{
    title: "کاربری یافت نشد",
    description: "هنوز کاربری ثبت نشده",
    action: <Button>افزودن کاربر</Button>
  }}
/>
```

**Modal** - Reusable modal/dialog:
```typescript
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="عنوان مودال"
  description="توضیحات"
  size="md"
  icon={<QuestionIcon />}
>
  {/* Modal content */}
</Modal>
```

**Badge** - Status indicators:
```typescript
<Badge variant="success" dot>تکمیل شده</Badge>
<Badge variant="warning" icon={<ClockIcon />}>در انتظار</Badge>
```

**Button** - Consistent button variants:
```typescript
<Button variant="primary" size="lg" icon={<PlusIcon />}>
  افزودن
</Button>
<Button variant="danger" loading={isDeleting}>
  حذف
</Button>
```

**Form Components** - Input, TextArea, Select with consistent styling:
```typescript
<FormField label="نام کاربر" required>
  <Input placeholder="نام را وارد کنید" />
</FormField>

<FormField label="توضیحات">
  <TextArea rows={4} />
</FormField>

<FormField label="دسته‌بندی">
  <Select>
    <option>انتخاب کنید</option>
  </Select>
</FormField>
```

### Layout Components (`src/components/layout/`)

**PageContainer** - Consistent page wrapper:
```typescript
<PageContainer maxWidth="2xl">
  {/* Page content */}
</PageContainer>
```

**PageHeader** - Page title and subtitle:
```typescript
<PageHeader 
  title="سلام، کاربر!"
  subtitle="توضیحات صفحه"
  icon="👋"
/>
```

**TabNavigation** - Reusable tabs:
```typescript
const tabs = [
  { id: "dashboard", label: "داشبورد" },
  { id: "settings", label: "تنظیمات" },
];

<TabNavigation 
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Section** - Content section wrapper:
```typescript
<Section variant="glass" padding="lg">
  {/* Section content */}
</Section>
```

### Match Components (`src/components/match/`)

**WaitingScreen** - Waiting for opponent:
```typescript
<WaitingScreen onCancel={handleCancel} />
```

**PlayerCard** - Display player information:
```typescript
<PlayerCard
  name="علی"
  score={5}
  time={120}
  isWinner={true}
  isCurrentUser={true}
/>
```

**MatchStatusBadge** - Match status indicator:
```typescript
<MatchStatusBadge status="active" />
```

### Custom Hooks (`src/hooks/`)

**useGameState** - Game state machine:
```typescript
const {
  gameState,        // "lobby" | "waiting" | "playing" | "results"
  currentMatchId,
  isResetting,
  setToLobby,
  setToWaiting,
  setToPlaying,
  setToResults,
  resetGame,
} = useGameState();
```

**useMatchStatusMonitor** - Monitor match status changes:
```typescript
const matchStatus = useMatchStatusMonitor({
  gameState,
  isResetting,
  onMatchWaiting: (matchId) => setToWaiting(matchId),
  onMatchActive: (matchId) => setToPlaying(matchId),
  onMatchCancelled: () => resetGame(),
});
```

### Utility Functions (`src/lib/`)

**Validation** (`validation.ts`):
```typescript
// Password validation
const result = validatePassword(password);
if (!result.isValid) {
  console.error(result.errors);
}

// Email validation
validateEmail(email);

// File validation
validateFileSize(file.size, 10); // 10 MB max
validateFileType(file.type, ALLOWED_TYPES);
```

**Formatting** (`formatting.ts`):
```typescript
// File size
formatFileSize(1024000); // "۱.۰۲ مگابایت"

// Persian numbers
toPersianNumber(123); // "۱۲۳"

// Time formatting
formatTime(90); // "۰۱:۳۰"

// Date formatting
formatDate(Date.now()); // "۱۴ دی ۱۴۰۳"
formatRelativeTime(timestamp); // "۵ دقیقه پیش"
```

**Storage** (`storage.ts`):
```typescript
// Safe localStorage access
const value = getStorageItem('key', defaultValue);
setStorageItem('key', value);
removeStorageItem('key');

// Check availability
if (isStorageAvailable()) {
  // Use localStorage
}
```

**Helpers** (`helpers.ts`):
```typescript
// Delay
await delay(1000);

// Debounce/Throttle
const debouncedFn = debounce(fn, 300);
const throttledFn = throttle(fn, 1000);

// Array helpers
shuffle(array);
unique(array);
groupBy(array, (item) => item.category);
```

## ⚡ Performance Optimization

### Code Splitting & Lazy Loading

**Route-based Code Splitting:**

The application implements route-based code splitting to reduce initial bundle size and improve load times.

**Implementation in App.tsx:**
```typescript
// IMPORTANT: Import lazy and Suspense from 'react', not 'react-router-dom'
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PageLoader } from "./components/ui";

// Lazy load route components
const HomePage = lazy(() => 
  import("./pages/HomePage").then(m => ({ default: m.HomePage }))
);
const LoginPage = lazy(() => 
  import("./pages/LoginPage").then(m => ({ default: m.LoginPage }))
);
const AdminPage = lazy(() => 
  import("./pages/AdminPage").then(m => ({ default: m.AdminPage }))
);

// Wrap routes with Suspense
<Suspense fallback={<PageLoader message="در حال بارگذاری صفحه..." />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
</Suspense>
```

**Benefits:**
- ✅ **Smaller Initial Bundle**: Only load code for the current route
- ✅ **Faster First Paint**: Reduced JavaScript parse time
- ✅ **Better Caching**: Routes cached separately by browser
- ✅ **Improved Performance**: Especially on slow networks
- ✅ **On-Demand Loading**: Features loaded when needed

**Bundle Organization:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js          # Main app bundle (small)
│   ├── HomePage-[hash].js        # Home page chunk
│   ├── AdminPage-[hash].js       # Admin page chunk
│   ├── LoginPage-[hash].js       # Login page chunk
│   └── vendor-[hash].js          # Third-party dependencies
```

**Loading Flow:**
1. User visits app → Loads main bundle (small)
2. Navigates to /admin → Lazy loads AdminPage chunk
3. Suspense shows PageLoader during load
4. Chunk loads → Component renders
5. Subsequent visits use cached chunk

## 🛡️ Error Handling & Loading States

### Error Boundary Architecture

**Implementation:**
```typescript
// ErrorBoundary component (Class-based for error catching)
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
    // Optional: Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallbackUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Usage Pattern:**
```typescript
// App.tsx - Route-level error boundaries
<ErrorBoundary>
  <Routes>
    <Route path="/" element={
      <ErrorBoundary>
        <HomePage />
      </ErrorBoundary>
    } />
    <Route path="/admin" element={
      <ErrorBoundary>
        <AdminPage />
      </ErrorBoundary>
    } />
  </Routes>
</ErrorBoundary>
```

**Benefits:**
- ✅ Prevents entire app crashes
- ✅ Shows user-friendly error messages
- ✅ Allows retry functionality
- ✅ Can log errors for debugging
- ✅ Isolated error boundaries per route

### Loading State Patterns

**Page-level Loading:**
```typescript
// Pages show PageLoader while data loads
if (userProfile === undefined) {
  return <PageLoader message="در حال بارگذاری..." />;
}
```

**Component-level Loading:**
```typescript
// Use skeleton screens for better UX
{isLoading ? (
  <SkeletonTable />
) : (
  <DataTable data={data} />
)}
```

**Button Loading States:**
```typescript
// Visual feedback on form submission
<button disabled={isSubmitting}>
  {isSubmitting ? (
    <div className="flex items-center gap-2">
      <Spinner />
      <span>در حال پردازش...</span>
    </div>
  ) : (
    "ذخیره"
  )}
</button>
```

**Loading Components:**
- `<PageLoader />` - Full page loading with message
- `<LoadingSpinner />` - Basic spinner
- `<Skeleton />` - Customizable skeleton
- `<SkeletonCard />` - Pre-built card skeleton
- `<SkeletonTable />` - Pre-built table skeleton
- `<SkeletonForm />` - Pre-built form skeleton

## 🔒 Security Patterns

### Frontend Security

**Route protection:**
```typescript
// Redirect if not authenticated
useEffect(() => {
  if (loggedInUser === null) {
    navigate("/login");
  }
}, [loggedInUser]);

// Redirect if not admin
useEffect(() => {
  if (userProfile && !userProfile.isAdmin) {
    navigate("/");
  }
}, [userProfile]);
```

**Input validation:**
```typescript
// Client-side validation
const errors = validatePassword(password);
if (errors.length > 0) {
  toast.error("رمز عبور معتبر نیست");
  return;
}

// Server validates anyway
await signIn("password", formData);
```

### Backend Security

**Authentication check:**
```typescript
export const protectedQuery = query({
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    // Only authenticated users reach here
  }
});
```

**Admin check:**
```typescript
export const adminQuery = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // Only admins reach here
  }
});
```

**Answer security:**
```typescript
// ✅ Get question without answer
const question = await ctx.db.get(questionId);
// Returns: { questionText, options... } (NO correct answer)

// ✅ Validate answer server-side
const answerEntry = await ctx.db
  .query("questionAnswers")
  .withIndex("by_question", q => q.eq("questionId", questionId))
  .unique();

const isCorrect = selectedAnswer === answerEntry.correctOption;
// Return only boolean, not the correct answer
```

## 📄 Pagination Patterns

### Backend Pagination (Convex)

All list queries use **cursor-based pagination** for optimal performance:

```typescript
// Standard pagination query pattern
export const getItems = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const paginatedResult = await ctx.db
      .query("tableName")
      .order("desc")
      .paginate(args.paginationOpts);
    
    return {
      page: paginatedResult.page,
      isDone: paginatedResult.isDone,
      continueCursor: paginatedResult.continueCursor,
    };
  },
});
```

**Paginated Queries:**
- `auth.getAllUsers` - User list (5 per page)
- `questions.getAllQuestions` - Questions list (5 per page)
- `files.getAllFiles` - Files list (5 per page)
- `matchAdmin.getAllMatches` - All matches (5 per page)
- `matchResults.getUserMatchHistory` - Match history (10 per page)

### Frontend Pagination

**State management pattern:**
```typescript
// Cursor history for back navigation
const [cursor, setCursor] = useState<string | null>(null);
const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
const [currentPage, setCurrentPage] = useState(1);
const PAGE_SIZE = 10;

// Query with pagination
const result = useQuery(api.module.queryName, {
  paginationOpts: { numItems: PAGE_SIZE, cursor },
});

// Next page handler
const handleNext = () => {
  if (result && !result.isDone) {
    const newCursor = result.continueCursor;
    setCursorHistory(prev => [...prev, newCursor]);
    setCursor(newCursor);
    setCurrentPage(prev => prev + 1);
  }
};

// Previous page handler
const handlePrev = () => {
  if (currentPage > 1) {
    const newHistory = cursorHistory.slice(0, -1);
    setCursorHistory(newHistory);
    setCursor(newHistory[newHistory.length - 1]);
    setCurrentPage(prev => prev - 1);
  }
};
```

**Shared UI component:**
```typescript
import { PaginationControls } from "../components/ui";

<PaginationControls 
  currentPage={currentPage}
  isDone={result?.isDone ?? true}
  onNext={handleNext}
  onPrev={handlePrev}
/>
```

**Benefits:**
- ✅ Efficient for any dataset size (O(1) navigation)
- ✅ Maintains exact previous page state
- ✅ Consistent UI across all paginated views
- ✅ Real-time data updates preserved
- ✅ No offset-based query issues

## 🚦 File Size Guidelines

- **Small**: < 200 lines (ideal for most components)
- **Medium**: 200-500 lines (acceptable for complex components)
- **Large**: 500-1000 lines (consider breaking down)
- **Very Large**: > 1000 lines (should be refactored)

**When to split:**
1. Component has multiple responsibilities → Extract features
2. Repeated UI patterns → Extract shared components
3. Complex state logic → Create custom hooks
4. Large data transformation → Move to utilities

## 📊 Statistics

### Frontend
- **Total Components**: 50+ files
- **Routes**: 10+ route files (Expo Router)
- **Features**: 3 modules (auth, game, admin)
- **Shared UI Components**: 13+ reusable components
- **Layout Components**: 4 layout components
- **Match Components**: 3 specialized components
- **Custom Hooks**: 3 state management hooks
- **Utility Files**: 8 utility modules
- **Barrel Exports**: 8+ index files

### Backend (Convex)
- **API Files**: 15+ feature files (modularized)
- **Database Tables**: 11 tables (including tournaments)
- **Queries**: 25+ read operations
- **Mutations**: 30+ write operations
- **Tournament System**: Full 4-player tournament with brackets
- **Code Organization**: Separated by responsibility (matches, tournaments, etc.)

## 🔄 Adding New Features

### Frontend Feature

1. **Create feature folder:**
   ```bash
   mkdir -p src/features/[feature-name]/components
   ```

2. **Add components:**
   ```bash
   touch src/features/[feature-name]/components/Component1.tsx
   ```

3. **Create barrel export:**
   ```typescript
   // src/features/[feature-name]/index.ts
   export { Component1 } from './components/Component1';
   ```

4. **Create route file (if new page):**
   ```typescript
   // app/new-page.tsx
   import { NewPageComponent } from "../src/features/new-feature";
   
   export default function NewPageScreen() {
     return <NewPageComponent />;
   }
   ```
   
   Or if it needs to be in a tab:
   ```typescript
   // app/(tabs)/new-page.tsx
   export default function NewPageScreen() {
     return <NewPageComponent />;
   }
   ```
   
   Then configure in `app/(tabs)/_layout.tsx` if needed.

### Backend Feature

1. **Create API file:**
   ```bash
   touch convex/[feature-name].ts
   ```

2. **Define schema:**
   ```typescript
   // convex/schema.ts
   [featureName]: defineTable({ /* ... */ })
   ```

3. **Create APIs:**
   ```typescript
   // convex/[feature-name].ts
   export const getData = query({ /* ... */ });
   export const updateData = mutation({ /* ... */ });
   ```

4. **Use in frontend:**
   ```typescript
   const data = useQuery(api.[featureName].getData);
   ```

## 📚 Related Documentation

- **[README.md](./README.md)** - Overview, features, getting started
- **[DESIGN.md](./DESIGN.md)** - Design system, styling, components

---

## 🎯 Refactoring Benefits

### What Was Improved

1. **✅ Modular Backend**
   - Split large `matches.ts` (787 lines) into 4 focused modules
   - Each module has single responsibility
   - Easier to maintain and test
   - Better code organization

2. **✅ Reusable Components**
   - Created 11 shared UI components (DataTable, Modal, Badge, etc.)
   - 3 specialized match components
   - Reduced code duplication across admin tabs
   - Consistent design patterns

3. **✅ Performance Optimization** (NEW!)
   - Implemented route-based code splitting with React.lazy()
   - Added Suspense boundaries for smooth loading
   - Reduced initial bundle size significantly
   - Faster page load times and better caching
   - On-demand loading for better performance

4. **✅ Error Handling & Loading States**
   - Added ErrorBoundary for graceful error handling
   - Implemented PageLoader for better loading UX
   - Created skeleton components for perceived performance
   - Enhanced all forms with loading indicators
   - Route-level error isolation

5. **✅ Custom Hooks**
   - Extracted complex game state logic to `useGameState`
   - Centralized match status monitoring in `useMatchStatusMonitor`
   - Simplified HomePage component
   - Reusable state management patterns

6. **✅ Better Developer Experience**
   - Clearer file organization
   - Easier to find and modify code
   - Better type safety with TypeScript
   - Improved documentation
   - Production-ready error handling
   - Optimized bundle sizes with code splitting

### File Size Improvements

**Before:**
- `HomePage.tsx`: 307 lines
- `matches.ts`: 787 lines
- Duplicated table code across admin tabs
- Limited utility functions
- No layout components
- No error handling components
- Basic loading states

**After:**
- `HomePage.tsx`: 211 lines (31% reduction!)
- `matchCore.ts`: 174 lines
- `matchGameplay.ts`: 148 lines
- `matchResults.ts`: 137 lines
- `matchAdmin.ts`: 83 lines
- Reusable DataTable component used everywhere
- **4 layout components** for consistent UI
- **5 utility modules** with 40+ helper functions
- **3 new UX components** (ErrorBoundary, PageLoader, Skeleton)
- **Enhanced loading states** across all forms and pages

---

## 📱 React Native Architecture (Current Implementation)

### Expo Router File-Based Routing

The app uses **Expo Router** (not React Router) for navigation:

**Key Differences:**
- File-based routing instead of route definitions
- Groups `(auth)`, `(tabs)` for route organization
- Dynamic routes `[id].tsx` for parameters
- Automatic navigation guards via route structure

### Expo Router Navigation

**File = Route:**
- `app/(tabs)/index.tsx` → `/` (Dashboard)
- `app/(tabs)/new-match.tsx` → `/new-match` (Match Lobby)
- `app/(tabs)/tournaments.tsx` → `/tournaments` (Tournament Lobby)
- `app/(tabs)/history.tsx` → `/history` (Match History)
- `app/(tabs)/play.tsx` → `/play` (Active Game - hidden tab)
- `app/(tabs)/results/[id].tsx` → `/results/:id` (Match Results - hidden tab)
- `app/(auth)/login.tsx` → `/login` (Login)
- `app/(auth)/profile-setup.tsx` → `/profile-setup` (Profile Setup)
- `app/tournament/[id].tsx` → `/tournament/:id` (Tournament Detail)
- `app/admin.tsx` → `/admin` (Admin Panel)

**Route Groups:**
- `(tabs)` - Tab navigation group (visible in tab bar)
- `(auth)` - Authentication group (not in tab bar)

**Hidden Tabs:**
- `play.tsx` and `results/[id].tsx` have `href: null` in tab config

### Navigation Patterns

**Programmatic Navigation:**
```tsx
import { useRouter } from "expo-router";

const router = useRouter();

router.push("/admin");              // Navigate to route
router.push("/tournament/abc123");  // Navigate with params
router.replace("/login");           // Replace current route
router.back();                      // Go back
router.push("/(tabs)");             // Navigate to tab group
```

**Tab Navigation:**
```tsx
// Configured in app/(tabs)/_layout.tsx
<Tabs screenOptions={{ ... }}>
  <Tabs.Screen name="index" options={{ title: "داشبورد" }} />
  <Tabs.Screen name="new-match" options={{ title: "مسابقه جدید" }} />
  <Tabs.Screen name="tournaments" options={{ title: "تورنومنت‌ها" }} />
  <Tabs.Screen name="history" options={{ title: "تاریخچه" }} />
  <Tabs.Screen name="play" options={{ href: null }} /> // Hidden
  <Tabs.Screen name="results/[id]" options={{ href: null }} /> // Hidden
</Tabs>
```

**Route Parameters:**
```tsx
// app/tournament/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function TournamentScreen() {
  const { id } = useLocalSearchParams();
  // Use tournament ID
}
```

### State Management (Unchanged)

Convex real-time state works identically on all platforms:

```tsx
// Same code for web, iOS, and Android
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const matches = useQuery(api.matches.getAllMatches);
const createMatch = useMutation(api.matches.createMatch);
```

### Component Architecture

**React Native Component Structure:**
```tsx
// Web version (old)
export function MyComponent() {
  return (
    <div className="...">
      <h1 className="...">Title</h1>
      <button onClick={handleClick}>Click</button>
    </div>
  );
}

// React Native version (new)
import { View, Text, TouchableOpacity } from "react-native";

export function MyComponent() {
  return (
    <View className="...">
      <Text className="...">Title</Text>
      <TouchableOpacity onPress={handleClick}>
        <Text>Click</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Component Status

**✅ React Native Components:**
- All UI components (Button, Badge, Modal, DataTableRN, etc.)
- All layout components (PageContainer, PageHeader, etc.)
- All match components (WaitingScreen, PlayerCard, MatchStatusBadge)
- All game components (QuizGame, MatchLobby, TournamentLobby, etc.)
- All auth components (SignInForm, SignUpForm, ProfileSetup, SignOutButton)
- Admin components (QuestionsForm, CategoryForm, FilesTable, etc.)

**Platform Support:**
- Web: React Native Web renders as HTML
- iOS: Native iOS components
- Android: Native Android components
- One codebase for all platforms

### Platform Detection

```tsx
import { Platform } from "react-native";

// Conditional rendering
{Platform.OS === 'web' && <WebOnlyComponent />}
{Platform.OS !== 'web' && <MobileComponent />}

// Platform-specific values
const fontSize = Platform.select({
  ios: 16,
  android: 14,
  web: 15,
});

// Check specific platform
if (Platform.OS === 'ios') {
  // iOS-specific code
}
```

### Styling with NativeWind

**NativeWind = Tailwind for React Native:**

```tsx
// Same classes work everywhere!
<View className="bg-background flex-1 p-6">
  <Text className="text-accent text-2xl font-bold">
    عنوان
  </Text>
  <TouchableOpacity className="bg-accent px-6 py-3 rounded-lg">
    <Text className="text-white font-semibold">دکمه</Text>
  </TouchableOpacity>
</View>
```

**Custom theme in tailwind.config.js:**
```js
module.exports = {
  content: ["./app/**/*.{js,tsx,ts}", "./src/**/*.{js,tsx,ts}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: "#06202F", light: "#0a2840" },
        accent: { DEFAULT: "#ff701a", hover: "#e55a00" },
      },
    },
  },
};
```

### Font Configuration

**Expo Font Loading:**
```tsx
// app/_layout.tsx
import { useFonts } from "expo-font";

const [fontsLoaded] = useFonts({
  "Vazirmatn-Regular": require("../assets/fonts/Vazirmatn-Regular.ttf"),
  "Vazirmatn-Medium": require("../assets/fonts/Vazirmatn-Medium.ttf"),
  "Vazirmatn-SemiBold": require("../assets/fonts/Vazirmatn-SemiBold.ttf"),
  "Vazirmatn-Bold": require("../assets/fonts/Vazirmatn-Bold.ttf"),
});
```

**NativeWind font classes map to font families:**
- `font-normal` → Vazirmatn-Regular
- `font-medium` → Vazirmatn-Medium
- `font-semibold` → Vazirmatn-SemiBold
- `font-bold` → Vazirmatn-Bold

### RTL Configuration

**Force RTL globally:**
```tsx
// app/_layout.tsx
import { I18nManager } from "react-native";

if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}
```

**Text alignment:**
```tsx
<Text className="text-right">متن فارسی</Text>
```

### Toast Notifications

**Custom implementation for React Native:**
```tsx
// src/lib/toast.tsx
import Toast from "react-native-toast-message";

export const toast = {
  success: (message: string) => Toast.show({ type: "success", text1: message }),
  error: (message: string) => Toast.show({ type: "error", text1: message }),
  // ... more
};
```

**Usage (same API as web):**
```tsx
import { toast } from "../lib/toast";

toast.success("عملیات موفق بود");
toast.error("خطا رخ داد");
```

### Metro Bundler

**Configuration for NativeWind + Convex:**
```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts = [...config.resolver.sourceExts, 'css'];

module.exports = withNativeWind(config, { input: './global.css' });
```

### Build & Deployment

**Development:**
```bash
npm start          # Expo dev server
npm run web        # Web
npm run ios        # iOS simulator
npm run android    # Android emulator
```

**Production:**
```bash
npm run build:web      # Expo web build
npm run build:vercel   # Vercel-optimized web build
eas build --platform ios      # iOS build (EAS)
eas build --platform android  # Android build (EAS)
```

### Vercel Build Architecture

The project includes **Vercel-specific optimizations** for web deployment:

**1. Conditional Platform Configuration (`app.config.js`)**

The app configuration conditionally excludes iOS/Android configs when building on Vercel:

```javascript
// Check if building on Vercel (web-only build)
const isVercelBuild = process.env.VERCEL === "1";

export default {
  expo: {
    // ... base config
    
    // Only include iOS config for local builds, exclude on Vercel
    ...(!isVercelBuild && {
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.12mvp.app",
        // ... iOS config
      }
    }),
    
    // Only include Android config for local builds, exclude on Vercel
    ...(!isVercelBuild && {
      android: {
        package: "com.mvp12.app",
        // ... Android config
      }
    }),
    
    // Web config always included
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    }
  }
};
```

**Benefits:**
- ✅ **Faster Builds**: Excludes unnecessary iOS/Android configuration processing
- ✅ **Smaller Bundle**: Only web assets included
- ✅ **Cleaner Output**: No mobile-specific files in web deployment
- ✅ **Automatic Detection**: Uses `VERCEL=1` environment variable (set by Vercel)

**2. Vercel Configuration (`vercel.json`)**

```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Configuration Details:**
- **buildCommand**: Uses `expo export` to generate static web build
- **outputDirectory**: Expo outputs to `dist/` directory
- **framework**: Set to `null` (custom Expo build, not a framework)
- **rewrites**: SPA routing - all routes serve `index.html` for client-side routing

**3. Vercel Speed Insights Integration**

Performance monitoring integrated in `app/_layout.tsx`:

```typescript
useEffect(() => {
  if (Platform.OS !== "web") {
    return;
  }

  import("@vercel/speed-insights")
    .then(({ injectSpeedInsights }) => {
      injectSpeedInsights();
    })
    .catch((error) => {
      console.warn("Failed to initialize Vercel Speed Insights:", error);
    });
}, []);
```

**Features:**
- ✅ **Web Only**: Only loads on web platform (not mobile)
- ✅ **Lazy Loading**: Dynamically imports to avoid bundle bloat
- ✅ **Error Handling**: Gracefully handles import failures
- ✅ **Real-time Metrics**: Provides performance insights in Vercel dashboard

**4. Build Scripts**

```json
{
  "scripts": {
    "build": "expo export",
    "build:web": "expo export",
    "build:vercel": "expo export"
  }
}
```

All web build scripts use `expo export` which:
- Generates static HTML/CSS/JS files
- Optimizes assets for production
- Creates SPA-compatible routing structure
- Outputs to `dist/` directory

**5. Deployment Flow**

**Vercel Automatic Deployment:**
1. Push to connected Git branch
2. Vercel detects `vercel.json`
3. Sets `VERCEL=1` environment variable
4. Runs `npm run build:vercel`
5. Serves files from `dist/` directory
6. Applies SPA rewrites for routing

**Environment Variables Required:**
- `EXPO_PUBLIC_CONVEX_URL` - Convex backend URL (required)
- `VERCEL=1` - Automatically set by Vercel (detects build environment)

**Files Excluded (`.vercelignore`):**
- `node_modules/`
- `.git/`
- `.expo/`
- `dist/`
- `.env.*` files

### Testing Strategy

**Platform-specific testing:**
1. **Web**: Test in Chrome/Firefox with responsive design mode
2. **iOS**: Test in iOS simulator or physical device
3. **Android**: Test in Android emulator or physical device

**Test checklist:**
- [ ] Authentication flow
- [ ] Match creation and gameplay
- [ ] Real-time updates (Convex)
- [ ] Navigation (Expo Router)
- [ ] Toast notifications
- [ ] RTL layout
- [ ] Persian fonts
- [ ] Form submissions
- [ ] Admin panel (web/tablet only)

### Performance Optimizations

**Same as web, plus:**
- **Native optimizations**: React Native's native components
- **Bundle splitting**: Expo's automatic code splitting
- **Image optimization**: Use `expo-image` for optimized images
- **List virtualization**: Use `FlatList` for long lists

### Known Limitations

1. **Admin Panel**: Recommended for web/tablet only (screen size)
2. **Complex Tables**: May need mobile-optimized views
3. **File Uploads**: Use platform-specific APIs
4. **Web-specific libraries**: Must find React Native alternatives

## 📚 Additional Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Convex with React Native](https://docs.convex.dev/)

## 🏟️ Tournament Architecture

### Tournament Flow

**1. Tournament Creation:**
- User creates tournament (with optional category or random)
- Tournament starts in "waiting" status
- Expires after 24 hours if not filled

**2. Tournament Joining:**
- Up to 4 players can join
- When 4th player joins, tournament automatically starts

**3. Tournament Structure:**
- **Semi-finals**: 2 matches (Player 1 vs Player 2, Player 3 vs Player 4)
- **Final**: Winners of semi-finals face each other
- Final match created automatically when both semi-finals complete

**4. Tournament States:**
- `waiting` - Waiting for 4 players
- `active` - Tournament in progress
- `completed` - Tournament finished
- `cancelled` - Tournament cancelled

### Tournament Data Model

```typescript
tournaments: {
  tournamentId: string,      // Unique identifier
  status: "waiting" | "active" | "completed" | "cancelled",
  categoryId?: Id<"categories">, // Optional category
  isRandom: boolean,         // Random questions if true
  creatorId: Id<"users">,
  createdAt: number,
  expiresAt: number,
}

tournamentParticipants: {
  tournamentId: string,
  userId: Id<"users">,
  joinedAt: number,
}

tournamentMatches: {
  tournamentId: string,
  matchId: Id<"matches">,
  round: "semi1" | "semi2" | "final",
  player1Id: Id<"users">,
  player2Id: Id<"users">,
  status: "waiting" | "active" | "completed",
  winnerId?: Id<"users">,
}
```

### Tournament API Flow

**Frontend:**
```typescript
// Create tournament
const tournamentId = await createTournament({ 
  categoryId: optionalCategoryId,
  isRandom: !optionalCategoryId 
});

// Join tournament
await joinTournament({ tournamentId });

// Get tournament details
const tournament = await getTournamentDetails({ tournamentId });

// Get tournament results (bracket view)
const results = await getTournamentResults({ tournamentId });
```

**Backend:**
- `tournamentCore.ts` - Core operations (create, join, leave)
- `tournamentResults.ts` - Results and history
- `tournamentAdmin.ts` - Admin operations
- `matchGameplay.ts` - Handles tournament progression when matches complete

## 🎯 Game Hints System

### Overview

The game includes a points-based hint system that allows players to get help during quiz questions. Players can use one hint per question, and each hint costs points.

### Available Hints

1. **Disable 1 Wrong Option** (2 points)
   - Disables one incorrect answer option
   - Mutation: `disableWrongOptions` with `numOptionsToDisable: 1`
   - Backend randomly selects one wrong option to disable

2. **Disable 2 Wrong Options** (5 points)
   - Disables two incorrect answer options
   - Mutation: `disableWrongOptions` with `numOptionsToDisable: 2`
   - Backend randomly selects two wrong options to disable

3. **Show Correct Answer** (7 points)
   - Disables all three wrong options
   - Highlights the correct answer with green color
   - Mutation: `showCorrectAnswer`
   - Returns the correct option number

### Implementation Details

**Backend (`convex/matchGameplay.ts`):**
- `disableWrongOptions()` - Disables wrong options (doesn't expose correct answer)
- `showCorrectAnswer()` - Shows correct answer and disables wrong options
- Both mutations check user points and deduct accordingly
- Uses `deductPoints()` utility from `utils.ts`

**Frontend (`src/features/game/components/QuizGame.tsx`):**
- State management for disabled options per question
- State management for correct option (when shown)
- State management for used hints (prevents multiple uses)
- Visual feedback:
  - Disabled options: Reduced opacity, strikethrough, X icon
  - Correct answer: Green highlight, checkmark icon
- One hint per question enforcement

### Rules

- ✅ Only one hint can be used per question
- ✅ Points are deducted immediately when hint is used
- ✅ Hints are disabled if user doesn't have enough points
- ✅ Hints are disabled after being used for that question
- ✅ Hints reset when moving to next question

**Last Updated**: December 2024  
**Maintainers**: Development Team
