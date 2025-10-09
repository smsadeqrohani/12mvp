# 📂 Architecture & Structure Documentation

Complete guide to the project's architecture, file organization, and code patterns for both frontend and backend.

## 📋 Table of Contents

- [Architecture Principles](#-architecture-principles)
- [Frontend Structure](#-frontend-structure)
- [Backend Structure](#-backend-structure)
- [Import Patterns](#-import-patterns)
- [Code Conventions](#-code-conventions)
- [Security Patterns](#-security-patterns)

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
│   │   └── PaginationControls.tsx
│   └── layout/                    # Layout components (future)
│
└── lib/                           # 🔧 Utilities
    ├── utils.ts                   # Helper functions (cn, etc.)
    └── constants.ts               # App-wide constants
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
├── matches.ts                      # 🎮 Match/Game API
│   ├── createMatch()             # Create/join match
│   ├── getMatchDetails()         # Get match info (no answers)
│   ├── getUserActiveMatch()      # Check active match
│   ├── getUserActiveMatchStatus() # Match status
│   ├── leaveMatch()              # Leave match
│   ├── submitAnswer()            # Submit answer (validates)
│   ├── getMatchResults()         # Get results (with answers)
│   ├── getUserMatchHistory()     # User's match history
│   ├── checkMatchCompletion()    # Check if completed
│   ├── getMatchResultsPartial()  # Partial results
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
- **Total Components**: 26 files
- **Pages**: 3 route components
- **Features**: 3 modules (auth, game, admin)
- **Shared Components**: 1 (expandable)
- **Barrel Exports**: 4 index files

### Backend (Convex)
- **API Files**: 6 feature files
- **Database Tables**: 8 tables
- **Queries**: 15+ read operations
- **Mutations**: 20+ write operations

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

**Last Updated**: October 9, 2025  
**Maintainers**: Development Team
