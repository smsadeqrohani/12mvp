# 🎨 Design System Documentation

Complete design system and styling guidelines for the 12 MVP Persian Quiz Application.

## 📋 Table of Contents

- [Color Palette](#-color-palette)
- [Typography](#-typography)
- [Components](#-components)
- [RTL Guidelines](#-rtl-guidelines)
- [Responsive Design](#-responsive-design)
- [Design Patterns](#-design-patterns)

## 🎨 Color Palette

### Primary Colors

```css
/* Background Colors */
--background: #06202F        /* Dark blue - Main background */
--background-light: #0a2840  /* Lighter blue - Cards, panels */

/* Accent Colors */
--accent: #ff701a            /* Orange - Primary actions */
--accent-hover: #e55a00      /* Darker orange - Hover states */

/* Text Colors */
--text-primary: #ffffff      /* White - Primary text */
--text-secondary: #d1d5db    /* Gray 300 - Secondary text */
--text-tertiary: #e5e7eb     /* Gray 200 - Labels */
```

### Tailwind CSS Classes

```css
/* Backgrounds */
bg-background           /* #06202F - Main background */
bg-background-light     /* #0a2840 - Secondary background */
bg-accent              /* #ff701a - Orange background */

/* Text */
text-accent            /* #ff701a - Orange text */
text-gray-300          /* Light gray - Secondary text */
text-gray-200          /* Lighter gray - Labels */
text-white             /* White - Primary text */

/* Borders */
border-gray-700        /* Dark borders */
border-gray-600        /* Medium borders */
border-accent          /* Orange borders */
```

### Usage Guidelines

**Background Colors:**
- Use `bg-background` for main page background
- Use `bg-background-light` for cards, modals, panels
- Add transparency with `/60` or `/80` for overlays

**Accent Color:**
- Use for primary buttons and CTAs
- Use for important text and headings
- Use for active states and highlights

**Text Colors:**
- `text-white` for primary headings and important text
- `text-gray-300` for body text and descriptions
- `text-gray-400` for helper text and placeholders
- `text-accent` for links and emphasized text

## 📝 Typography

### Font Family

**Primary Font**: Vazirmatn
- Optimized for Persian/Farsi text
- Supports full RTL rendering
- Variable weight support

**Fallback Stack**:
```css
font-family: 'Vazirmatn', 'Inter Variable', system-ui, sans-serif;
```

### Font Import

```css
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css');
```

### Font Sizes & Weights

```css
/* Headings */
text-4xl font-bold      /* Page titles - 36px */
text-3xl font-bold      /* Section titles - 30px */
text-2xl font-semibold  /* Card titles - 24px */
text-xl font-semibold   /* Subsection titles - 20px */

/* Body Text */
text-base               /* Default - 16px */
text-lg                 /* Large body - 18px */
text-sm                 /* Small text - 14px */
text-xs                 /* Helper text - 12px */

/* Weights */
font-bold               /* 700 - Headings */
font-semibold           /* 600 - Subheadings */
font-medium             /* 500 - Emphasized text */
font-normal             /* 400 - Body text */
```

### Typography Examples

```tsx
// Page Title
<h1 className="text-4xl font-bold text-accent">عنوان صفحه</h1>

// Section Title
<h2 className="text-2xl font-semibold text-white">عنوان بخش</h2>

// Body Text
<p className="text-gray-300">متن توضیحات</p>

// Helper Text
<span className="text-sm text-gray-400">راهنما</span>
```

## 🧩 Components

### Layout Components

#### PageContainer
Provides consistent page layout with standard padding and max-width:
```tsx
<PageContainer maxWidth="2xl">
  {/* Page content */}
</PageContainer>

// Available max-width options: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none"
```

#### PageHeader
Standardized page headers with title, subtitle, and icon:
```tsx
<PageHeader 
  title="سلام، کاربر!"
  subtitle="به داشبورد خوش آمدید"
  icon="👋"
/>
```

#### TabNavigation
Reusable tab navigation with active states:
```tsx
const tabs = [
  { id: "dashboard", label: "داشبورد" },
  { id: "settings", label: "تنظیمات", icon: <SettingsIcon /> },
];

<TabNavigation 
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

#### Section
Content section wrapper with variants:
```tsx
// Glass morphism variant
<Section variant="glass" padding="lg">
  {/* Content */}
</Section>

// Card variant
<Section variant="card" padding="md">
  {/* Content */}
</Section>
```

### Buttons

#### Primary Button (Accent)
```tsx
<button className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors">
  دکمه اصلی
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-3 bg-background-light hover:bg-gray-700 text-white border border-gray-600 rounded-lg font-semibold transition-colors">
  دکمه ثانویه
</button>
```

#### Danger Button
```tsx
<button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors">
  حذف
</button>
```

### Input Fields

#### Text Input (Auth Style)
```tsx
<input
  type="text"
  className="auth-input-field"
  placeholder="نام کاربری"
/>
```

**Custom Class Definition** (in `index.css`):
```css
.auth-input-field {
  @apply w-full px-4 py-3 bg-background-light border border-gray-600 
         rounded-lg text-white placeholder-gray-400 
         focus:border-accent focus:ring-2 focus:ring-accent/20 
         transition-all text-right;
}
```

#### Form Button
```tsx
<button type="submit" className="auth-button">
  ورود
</button>
```

**Custom Class Definition**:
```css
.auth-button {
  @apply w-full py-3 bg-accent hover:bg-accent-hover 
         text-white font-semibold rounded-lg 
         transition-colors disabled:opacity-50 
         disabled:cursor-not-allowed;
}
```

### Cards

#### Basic Card
```tsx
<div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
  {/* Card content */}
</div>
```

#### Interactive Card
```tsx
<div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6 hover:bg-background-light/80 transition-colors cursor-pointer">
  {/* Interactive content */}
</div>
```

### Modals/Dialogs

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
  <div className="bg-background-light rounded-2xl border border-gray-700 p-8 max-w-2xl w-full">
    {/* Modal content */}
  </div>
</div>
```

### Tables

```tsx
<table className="w-full">
  <thead>
    <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
      <th className="text-right px-6 py-4 text-gray-300 font-semibold text-sm">
        عنوان
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors">
      <td className="px-6 py-4 text-white">
        محتوا
      </td>
    </tr>
  </tbody>
</table>
```

### Utility Components

#### LoadingSpinner
Consistent loading state indicator:
```tsx
import { LoadingSpinner } from "../components/ui";

<LoadingSpinner />
```

#### PageLoader
Full-page loading state with custom message:
```tsx
import { PageLoader } from "../components/ui";

<PageLoader message="در حال بارگذاری..." />
```

#### Skeleton Components
Loading placeholders for better UX:
```tsx
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonForm } from "../components/ui";

// Basic skeleton
<Skeleton className="h-4 w-32" />

// Pre-built skeleton cards
<SkeletonCard />
<SkeletonTable />
<SkeletonForm />
```

#### ErrorBoundary
Graceful error handling component:
```tsx
import { ErrorBoundary } from "../components/ui";

<ErrorBoundary>
  {/* Your components */}
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  {/* Your components */}
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, errorInfo) => logError(error)}>
  {/* Your components */}
</ErrorBoundary>
```

#### WaitingScreen
Match waiting screen component:
```tsx
import { WaitingScreen } from "../components/match";

<WaitingScreen onCancel={handleCancel} />
```

### Toast Notifications

#### Configuration (in App.tsx)
```tsx
<Toaster
  position="top-center"
  expand={true}
  richColors={true}
  closeButton={true}
  duration={4000}
  toastOptions={{
    style: {
      direction: 'rtl',
      textAlign: 'right',
    },
    className: 'toast-rtl',
  }}
/>
```

#### Usage
```tsx
import { toast } from "sonner";

// Success
toast.success("عملیات با موفقیت انجام شد");

// Error
toast.error("خطا در انجام عملیات");

// Warning
toast.warning("توجه: این عملیات قابل بازگشت نیست");

// Info
toast.info("اطلاعات جدید موجود است");
```

#### Custom Toast Styles (in index.css)
```css
.toast-rtl {
  font-family: 'Vazirmatn', sans-serif !important;
  direction: rtl !important;
  text-align: right !important;
}

[data-sonner-toast] {
  background-color: #0a2840 !important;
  border: 1px solid rgba(107, 114, 128, 0.3) !important;
}

[data-sonner-toast][data-type="success"] {
  border-color: rgba(34, 197, 94, 0.3) !important;
}
```

## 🔄 RTL Guidelines

### Text Direction

**Global RTL** is set in `index.html`:
```html
<html lang="fa" dir="rtl">
```

### Padding & Margins

**Always use directional classes:**
```css
/* ❌ Avoid */
px-4        /* Generic horizontal padding */

/* ✅ Use instead */
pr-4 pl-4   /* Explicit right and left padding */
```

**RTL-aware spacing:**
```tsx
// Text alignment
<p className="text-right">متن فارسی</p>

// Flex direction (reversed in RTL)
<div className="flex items-center gap-3">
  <span>آیکون</span>
  <span>متن</span>
</div>
```

### Icons & Images

**Icon positioning:**
```tsx
// Icon on the right (start of text in RTL)
<button className="flex items-center gap-2">
  <svg className="w-4 h-4">...</svg>
  <span>متن دکمه</span>
</button>

// Icon on the left (end of text in RTL)
<button className="flex items-center gap-2">
  <span>متن دکمه</span>
  <svg className="w-4 h-4">...</svg>
</button>
```

### Forms

**Input fields:**
```tsx
<input
  type="text"
  className="text-right"  // Text aligns to right
  placeholder="متن راهنما"
  dir="rtl"              // Explicit RTL direction
/>
```

## 📱 Responsive Design

### Breakpoints (Tailwind defaults)

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large */
2xl: 1536px /* 2X Extra large */
```

### Mobile-First Approach

```tsx
// Default (mobile) → Tablet → Desktop
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">عنوان</h1>
</div>
```

### Responsive Grid

```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### Admin Panel Restriction

Admin panel requires minimum **1024px width** (desktop/tablet):
```tsx
const [isLargeScreen, setIsLargeScreen] = useState(true);

useEffect(() => {
  const checkScreenSize = () => {
    setIsLargeScreen(window.innerWidth >= 1024);
  };
  // ...
}, []);
```

## 📦 Component Library Summary

### Layout Components (4)
- `PageContainer` - Page wrapper
- `PageHeader` - Page titles
- `TabNavigation` - Tab interface
- `Section` - Content sections

### UI Components (13+)
- `Button` - Action buttons (React Native compatible)
- `Badge` - Status indicators
- `Modal` - Dialogs
- `DataTable` - Generic tables (web)
- `DataTableRN` - React Native data table
- `TextInput` - Text input component
- `FormField` - Form input wrapper
- `LoadingSpinner` - Loading states
- `PageLoader` - Full page loading
- `Skeleton` - Loading placeholders
- `ErrorBoundary` - Error handling
- `PaginationControls` - Pagination
- `KeyboardAvoidingContainer` - Keyboard handling
- `RTLView` - RTL wrapper

### Match Components (3)
- `WaitingScreen` - Waiting UI
- `PlayerCard` - Player display
- `MatchStatusBadge` - Status indicator

## 🎯 Design Patterns

### Spacing System

**Consistent spacing scale:**
```css
gap-2  /* 8px - Tight spacing */
gap-3  /* 12px - Compact */
gap-4  /* 16px - Default */
gap-6  /* 24px - Comfortable */
gap-8  /* 32px - Spacious */
```

### Border Radius

```css
rounded      /* 4px - Small elements */
rounded-lg   /* 8px - Cards, buttons */
rounded-xl   /* 12px - Large cards */
rounded-2xl  /* 16px - Modals, panels */
rounded-full /* Circles, pills */
```

### Shadows & Effects

```css
/* Subtle shadow */
shadow-sm

/* Default shadow */
shadow

/* Prominent shadow */
shadow-lg shadow-black/20

/* Backdrop blur (glassmorphism) */
backdrop-blur-sm bg-background-light/60
```

### Transitions

**Standard transitions:**
```css
transition-colors   /* Color changes */
transition-all      /* All properties */
duration-200        /* 200ms - Quick */
duration-300        /* 300ms - Default */
```

### State Styles

```tsx
// Hover
<button className="hover:bg-accent-hover hover:scale-105">

// Focus
<input className="focus:border-accent focus:ring-2 focus:ring-accent/20">

// Disabled
<button className="disabled:opacity-50 disabled:cursor-not-allowed">

// Active
<div className="bg-accent/20 border-accent">  // Active state
```

### Loading States

**Page-level loading:**
```tsx
// Full page loading
if (isLoading) {
  return <PageLoader message="در حال بارگذاری..." />;
}
```

**Component-level loading:**
```tsx
// Skeleton placeholders
{isLoading ? <SkeletonCard /> : <ActualCard data={data} />}
```

**Button loading states:**
```tsx
<button disabled={isSubmitting}>
  {isSubmitting ? (
    <div className="flex items-center justify-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span>در حال پردازش...</span>
    </div>
  ) : (
    "ذخیره"
  )}
</button>
```

### Error States

**Error boundaries:**
```tsx
// Wrap routes with error boundaries
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Form errors:**
```tsx
// Validation errors
{errors.length > 0 && (
  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
    <p className="text-red-400 text-sm font-semibold">خطا:</p>
    <ul className="text-red-300 text-sm">
      {errors.map(error => <li key={error}>• {error}</li>)}
    </ul>
  </div>
)}
```

### Code Splitting & Lazy Loading

**Route-based code splitting:**
```tsx
// IMPORTANT: Import lazy and Suspense from 'react', not 'react-router-dom'
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PageLoader } from "../components/ui";

// Lazy load route components
const HomePage = lazy(() => 
  import("./pages/HomePage").then(m => ({ default: m.HomePage }))
);

// Wrap with Suspense for loading state
<Suspense fallback={<PageLoader message="در حال بارگذاری صفحه..." />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
  </Routes>
</Suspense>
```

**Component-level lazy loading:**
```tsx
// For heavy components that aren't needed initially
const HeavyChart = lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

**Benefits:**
- ✅ Smaller initial bundle size
- ✅ Faster page load times
- ✅ Load only what's needed
- ✅ Better performance on slow networks

## 🔧 Configuration Files

### Tailwind Config (`tailwind.config.js`)

```js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#06202F',
        'background-light': '#0a2840',
        accent: '#ff701a',
        'accent-hover': '#e55a00',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Inter Variable', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### Global Styles (`src/index.css`)

```css
@import url('https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  direction: rtl;
}

body {
  @apply bg-background text-white;
  font-family: 'Vazirmatn', 'Inter Variable', system-ui, sans-serif;
}
```

## 📝 Best Practices

### DO's ✅

- ✅ Use custom Tailwind classes for consistency
- ✅ Test all components with Persian text
- ✅ Maintain RTL direction in all new components
- ✅ Use the defined color palette
- ✅ Follow the spacing system
- ✅ Add hover and focus states
- ✅ Use transitions for smooth interactions
- ✅ Test on mobile devices
- ✅ Use layout components (PageContainer, PageHeader, etc.)
- ✅ Import utilities from `lib/utils` for validation/formatting
- ✅ Add loading states to all async operations
- ✅ Wrap components with ErrorBoundary for error handling
- ✅ Use skeleton screens for better perceived performance
- ✅ Use lazy loading for routes to optimize bundle size
- ✅ Wrap lazy components with Suspense boundaries

### DON'Ts ❌

- ❌ Use LTR-specific layouts
- ❌ Hard-code colors (use Tailwind classes)
- ❌ Use `px-*` without considering RTL
- ❌ Forget accessibility (focus states)
- ❌ Use inconsistent spacing
- ❌ Mix different design patterns
- ❌ Use generic `margin` or `padding`
- ❌ Duplicate layout code (use layout components)
- ❌ Write custom validation/formatting (use utilities)
- ❌ Show blank screens during loading (use PageLoader/Skeleton)
- ❌ Let errors crash the app (use ErrorBoundary)

## 🎨 Design Examples

### Login Form
```tsx
<form className="flex flex-col gap-4">
  <input
    type="email"
    className="auth-input-field"
    placeholder="ایمیل"
  />
  <input
    type="password"
    className="auth-input-field"
    placeholder="رمز عبور"
  />
  <button type="submit" className="auth-button">
    ورود
  </button>
</form>
```

### Dashboard Card
```tsx
import { Section } from "../components/layout";

<Section variant="glass" padding="md" className="hover:bg-background-light/80 transition-all">
  <h3 className="text-xl font-semibold text-accent mb-3">عنوان کارت</h3>
  <p className="text-gray-300">توضیحات کارت</p>
</Section>
```

### Action Button
```tsx
import { Button } from "../components/ui";

<Button 
  variant="primary" 
  size="lg"
  className="shadow-lg hover:shadow-xl transform hover:scale-105"
>
  شروع مسابقه
</Button>
```

### Complete Page Example
```tsx
import { PageContainer, PageHeader, TabNavigation } from "../components/layout";
import { LoadingSpinner } from "../components/ui";

function MyPage() {
  const [activeTab, setActiveTab] = useState("tab1");

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { id: "tab1", label: "تب اول" },
    { id: "tab2", label: "تب دوم" },
  ];

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader 
        title="صفحه من"
        subtitle="توضیحات صفحه"
        icon="🎮"
      />

      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="min-h-[400px]">
        {/* Tab content */}
      </div>
    </PageContainer>
  );
}
```

---

**For implementation details**, see **[STRUCTURE.md](./STRUCTURE.md)**  
**For general info**, see **[README.md](./README.md)**

## 📱 React Native Design Patterns

### Platform-Specific Components

The app now supports web, iOS, and Android using React Native primitives:

**React Native Component Mapping:**
```tsx
// Web → React Native
div       → View
span      → Text
p         → Text
h1-h6     → Text (with size classes)
button    → TouchableOpacity + Text
input     → TextInput
img       → Image
```

### NativeWind (Tailwind for React Native)

All Tailwind classes work in React Native with NativeWind:

```tsx
import { View, Text } from "react-native";

// Same Tailwind classes as web!
<View className="bg-background flex-1 items-center justify-center">
  <Text className="text-accent text-2xl font-bold">سلام</Text>
</View>
```

### Toast Notifications (React Native)

Custom toast implementation using `react-native-toast-message`:

```tsx
import { toast } from "../lib/toast";

// Usage (same API as web)
toast.success("عملیات موفق");
toast.error("خطا رخ داد");
toast.info("اطلاعات");
toast.warning("هشدار");
```

**Configuration in app/_layout.tsx:**
```tsx
import Toast from "react-native-toast-message";
import { toastConfig } from "../src/lib/toast";

// Add at root level
<Toast config={toastConfig} />
```

**Custom toast config** (`src/lib/toast.tsx`):
- Persian text support
- RTL layout
- Custom styling matching app theme
- Success/Error/Info/Warning variants

### Button Component (React Native)

```tsx
import { Button } from "../components/ui";

<Button 
  variant="primary" 
  size="lg"
  onPress={() => console.log("pressed")}  // onPress instead of onClick
>
  کلیک کنید
</Button>
```

### Form Components (React Native)

```tsx
import { Input, TextArea, Select } from "../components/ui";

// Text Input
<Input
  value={text}
  onChangeText={setText}  // onChangeText instead of onChange
  placeholder="متن را وارد کنید"
  keyboardType="email-address"  // Platform-specific
/>

// Text Area
<TextArea
  value={description}
  onChangeText={setDescription}
  rows={4}
/>

// Select (Picker)
<Select value={category} onValueChange={setCategory}>
  <Picker.Item label="انتخاب کنید" value="" />
  <Picker.Item label="دسته ۱" value="cat1" />
</Select>
```

### Navigation (Expo Router)

File-based routing instead of React Router:

```tsx
// Instead of useNavigate
import { useRouter } from "expo-router";

const router = useRouter();

// Navigate
router.push("/admin");
router.replace("/login");
router.back();
```

### Icons (Expo Icons)

```tsx
import { Ionicons } from "@expo/vector-icons";

<Ionicons name="checkmark" size={24} color="#ff701a" />
<Ionicons name="close" size={20} color="#fff" />
```

### Images

```tsx
import { Image } from "react-native";

// Local image
<Image 
  source={require("../assets/logo.png")} 
  className="w-20 h-20"
/>

// Remote image
<Image 
  source={{ uri: "https://..." }} 
  className="w-full h-48"
/>
```

### RTL Support (React Native)

```tsx
import { I18nManager } from "react-native";

// Force RTL (done in app/_layout.tsx)
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

// Text alignment
<Text className="text-right">متن فارسی</Text>
```

### Safe Areas

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

<SafeAreaView className="flex-1 bg-background">
  {/* Content */}
</SafeAreaView>
```

### ScrollView

```tsx
import { ScrollView } from "react-native";

<ScrollView 
  className="flex-1"
  showsVerticalScrollIndicator={false}
>
  {/* Content */}
</ScrollView>
```

### Platform-Specific Code

```tsx
import { Platform } from "react-native";

// Conditional rendering
{Platform.OS === 'ios' && <IOSComponent />}
{Platform.OS === 'android' && <AndroidComponent />}
{Platform.OS === 'web' && <WebComponent />}

// Platform-specific values
const padding = Platform.select({
  ios: 20,
  android: 15,
  web: 10,
});
```

### Dimensions

```tsx
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const modalWidth = Math.min(width - 32, 600);
```

### Persian Fonts (React Native)

**Setup in app/_layout.tsx:**
```tsx
import { useFonts } from "expo-font";

const [fontsLoaded] = useFonts({
  "Vazirmatn-Regular": require("../assets/fonts/Vazirmatn-Regular.ttf"),
  "Vazirmatn-Bold": require("../assets/fonts/Vazirmatn-Bold.ttf"),
});
```

**Usage with NativeWind:**
```tsx
// Font weights automatically map to font families
<Text className="font-bold">متن بولد</Text>  // Uses Vazirmatn-Bold
<Text className="font-normal">متن عادی</Text>  // Uses Vazirmatn-Regular
```

## 🎯 Cross-Platform Best Practices

### DO's ✅
- ✅ Use NativeWind classes (work on all platforms)
- ✅ Use TouchableOpacity for clickable elements
- ✅ Use TextInput for form inputs
- ✅ Test on iOS, Android, and web
- ✅ Use Platform.select for platform-specific code
- ✅ Use SafeAreaView for safe areas
- ✅ Use ScrollView for scrollable content
- ✅ Keep exact same design and functionality

### DON'Ts ❌
- ❌ Don't use HTML elements (div, span, button)
- ❌ Don't use onClick (use onPress)
- ❌ Don't use onChange for TextInput (use onChangeText)
- ❌ Don't use CSS directly (use NativeWind classes)
- ❌ Don't use react-router (use expo-router)
- ❌ Don't use web-only libraries

## 📦 Current Component Library

### Feature Components

**Auth Features:**
- `SignInForm` - Email/password sign-in
- `SignUpForm` - User registration
- `ProfileSetup` - Profile creation
- `SignOutButton` - Logout button

**Game Features:**
- `HelloPage` - Dashboard welcome screen
- `MatchLobby` - 1v1 match lobby and matchmaking
- `TournamentLobby` - Tournament creation and joining
- `QuizGame` - Active quiz gameplay
- `MatchResults` - Match results display
- `MatchHistory` - User match history

**Admin Features:**
- `QuestionsForm` - Question CRUD
- `CategoryForm` - Category CRUD
- `FilesTable` - File management
- `FileUpload` - File upload component
- `FilePreview` - File preview modal
- `MatchDetailsAdmin` - Match monitoring

### Navigation Components

**Expo Router:**
- Tab navigation configured in `app/(tabs)/_layout.tsx`
- Tab bar with Persian labels
- Hidden tabs (play, results) for internal navigation
- Route groups for auth and tabs

**Last Updated**: December 2024

