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

```
src/
├── App.tsx                         # Main app with routing & layout
├── main.tsx                        # Application entry point
├── index.css                       # Global styles & RTL config
│
├── pages/                          # 📄 Top-level route pages
│   ├── HomePage.tsx               # Main dashboard with game tabs
│   ├── LoginPage.tsx              # Authentication page
│   └── AdminPage.tsx              # Admin management panel
│
├── features/                       # 🎯 Feature modules
│   │
│   ├── auth/                      # 🔐 Authentication Feature
│   │   ├── index.ts              # Barrel export
│   │   └── components/
│   │       ├── SignInForm.tsx    # Email/password sign-in
│   │       ├── SignUpForm.tsx    # User registration
│   │       ├── SignOutButton.tsx # Logout functionality
│   │       └── ProfileSetup.tsx  # User profile creation
│   │
│   ├── game/                      # 🎮 Game/Match Feature
│   │   ├── index.ts              # Barrel export
│   │   └── components/
│   │       ├── QuizGame.tsx      # Quiz gameplay logic
│   │       ├── MatchLobby.tsx    # Matchmaking & waiting
│   │       ├── MatchResults.tsx  # Results display
│   │       ├── MatchHistory.tsx  # User match history
│   │       └── HelloPage.tsx     # Dashboard welcome
│   │
│   └── admin/                     # ⚙️ Admin Feature
│       ├── index.ts              # Barrel export
│       └── components/
│           ├── QuestionsForm.tsx  # Question CRUD form
│           ├── FilesTable.tsx     # File management
│           ├── FilePreview.tsx    # File preview modal
│           └── MatchDetailsAdmin.tsx # Match monitoring
│
├── components/                     # 🧩 Shared components
│   ├── ui/                        # Reusable UI components
│   │   ├── index.ts              # Barrel export
│   │   ├── PaginationControls.tsx # Pagination component
│   │   ├── DataTable.tsx         # Generic data table
│   │   ├── Modal.tsx             # Modal/Dialog component
│   │   ├── Badge.tsx             # Status badges
│   │   ├── Button.tsx            # Button variants
│   │   ├── FormField.tsx         # Form input components
│   │   ├── LoadingSpinner.tsx    # Loading states
│   │   ├── PageLoader.tsx        # Full page loading (NEW!)
│   │   ├── Skeleton.tsx          # Loading placeholders (NEW!)
│   │   └── ErrorBoundary.tsx     # Error handling (NEW!)
│   │
│   ├── match/                     # Match-specific shared components
│   │   ├── index.ts              # Barrel export
│   │   ├── WaitingScreen.tsx     # Waiting for opponent screen
│   │   ├── PlayerCard.tsx        # Player display card
│   │   └── MatchStatusBadge.tsx  # Match status indicator
│   │
│   └── layout/                    # Layout components
│       ├── index.ts              # Barrel export
│       ├── PageContainer.tsx     # Page wrapper with padding
│       ├── PageHeader.tsx        # Page title/subtitle component
│       ├── TabNavigation.tsx     # Reusable tab navigation
│       └── Section.tsx           # Content section wrapper
│
├── hooks/                         # 🪝 Custom React hooks
│   ├── index.ts                  # Barrel export
│   ├── useGameState.ts           # Game state machine hook
│   └── useMatchStatusMonitor.ts  # Match status monitoring
│
└── lib/                           # 🔧 Utilities
    ├── utils.ts                   # Main utilities (cn, re-exports)
    ├── constants.ts               # App-wide constants
    ├── validation.ts              # Input validation utilities
    ├── formatting.ts              # Display formatting utilities
    ├── storage.ts                 # LocalStorage utilities
    └── helpers.ts                 # General helper functions
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

### Pages Organization

Pages are **top-level route components**:
- `HomePage.tsx` - Main app dashboard (contains tabs for game features)
- `LoginPage.tsx` - Authentication flow
- `AdminPage.tsx` - Admin panel (restricted to admin users)

Pages orchestrate features and don't contain business logic.

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
│   └── leaveMatch()              # Leave match
│
├── matchGameplay.ts                # 🎲 Gameplay Operations
│   ├── submitAnswer()            # Submit answer (validates)
│   └── checkMatchCompletion()    # Check if completed
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
├── files.ts                        # 📁 File Management API
│   ├── getAllFiles() [admin]     # List all files
│   ├── uploadFile() [admin]      # Upload file
│   ├── renameFile() [admin]      # Rename file
│   └── deleteFile() [admin]      # Delete file
│
├── utils.ts                        # 🛠️ Backend Utilities
│   ├── requireAuth()             # Ensure authenticated
│   ├── requireAdmin()            # Ensure admin
│   ├── adminOnly()               # Admin-only wrapper
│   ├── validateQuestion()        # Validate question data
│   └── getRandomQuestions()      # Get random questions
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

2. **Questions**
   - `questions` - Question data (no answers)
   - `questionAnswers` - Correct answers (secure)

3. **Matches**
   - `matches` - Match metadata
   - `matchParticipants` - Players & answers
   - `matchResults` - Final results

4. **Files**
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

**Pages import from features:**
```typescript
// pages/HomePage.tsx
import { ProfileSetup } from "../features/auth";
import { QuizGame, MatchLobby } from "../features/game";
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
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
- **Total Components**: 48+ files
- **Pages**: 3 route components
- **Features**: 3 modules (auth, game, admin)
- **Shared UI Components**: 11 reusable components (NEW!)
- **Layout Components**: 4 layout components
- **Match Components**: 3 specialized components
- **Custom Hooks**: 2 state management hooks
- **Utility Files**: 5 utility modules
- **Barrel Exports**: 8 index files

### Backend (Convex)
- **API Files**: 10 feature files (modularized)
- **Database Tables**: 8 tables
- **Queries**: 15+ read operations
- **Mutations**: 20+ write operations
- **Code Organization**: Separated by responsibility

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

4. **Use in pages:**
   ```typescript
   import { Component1 } from "../features/[feature-name]";
   ```

5. **Add lazy loading (if new page):**
   ```typescript
   // App.tsx
   // Ensure you have: import { lazy } from "react";
   
   const NewPage = lazy(() => 
     import("./pages/NewPage").then(m => ({ default: m.NewPage }))
   );
   
   // Add to routes (already wrapped in Suspense)
   <Route path="/new" element={<NewPage />} />
   ```

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

**Last Updated**: October 9, 2025  
**Maintainers**: Development Team
