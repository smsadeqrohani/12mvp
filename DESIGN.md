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

### DON'Ts ❌

- ❌ Use LTR-specific layouts
- ❌ Hard-code colors (use Tailwind classes)
- ❌ Use `px-*` without considering RTL
- ❌ Forget accessibility (focus states)
- ❌ Use inconsistent spacing
- ❌ Mix different design patterns
- ❌ Use generic `margin` or `padding`

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
<div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6 hover:bg-background-light/80 transition-all">
  <h3 className="text-xl font-semibold text-accent mb-3">عنوان کارت</h3>
  <p className="text-gray-300">توضیحات کارت</p>
</div>
```

### Action Button
```tsx
<button className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
  شروع مسابقه
</button>
```

---

**For implementation details**, see **[STRUCTURE.md](./STRUCTURE.md)**  
**For general info**, see **[README.md](./README.md)**

**Last Updated**: October 9, 2025

