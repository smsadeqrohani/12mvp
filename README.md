# 12 MVP - Persian RTL Application

A modern Persian (Farsi) application built with React, TypeScript, and Convex backend, featuring RTL (Right-to-Left) support and a custom dark theme design system.

## 🎨 Design System

### Color Palette
- **Primary Background**: `#06202F` (Dark Blue)
- **Secondary Background**: `#0a2840` (Lighter Blue)
- **Accent Color**: `#ff701a` (Orange)
- **Accent Hover**: `#e55a00` (Darker Orange)
- **Text Colors**: White and light gray variants for contrast

### Typography
- **Primary Font**: Vazirmatn (Persian/Farsi optimized)
- **Fallback Fonts**: Inter Variable, system fonts
- **Direction**: RTL (Right-to-Left) for Persian text

### Theme
- **Mode**: Dark theme only
- **Layout**: RTL-first design
- **Components**: Custom styled with consistent spacing and shadows

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom configuration
- **Backend**: Convex (real-time database and auth)
- **Authentication**: Convex Auth with Anonymous auth
- **UI Components**: Custom components with Persian translations

## 📁 Project Structure

```
src/
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── index.css            # Global styles and RTL configuration
├── SignInForm.tsx       # Persian sign-in form
├── SignUpForm.tsx       # Persian sign-up form
├── SignOutButton.tsx    # Persian sign-out button
├── ProfileSetup.tsx     # Persian profile setup
├── HelloPage.tsx        # Persian dashboard/welcome page
└── lib/
    └── utils.ts         # Utility functions
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```
   This starts both frontend (Vite) and backend (Convex) servers.

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Convex Dashboard: https://dashboard.convex.dev

## 🎯 Features

- ✅ **Persian Language Support**: Full RTL text and UI translations
- ✅ **Dark Theme**: Custom dark blue and orange color scheme
- ✅ **Authentication**: Sign up, sign in, and anonymous authentication
- ✅ **Profile Management**: User profile creation and management
- ✅ **Responsive Design**: Mobile-first responsive layout
- ✅ **RTL Layout**: Proper right-to-left text and layout support
- ✅ **Toast Notifications**: Comprehensive notification system with Persian messages

## 🔔 Toast Notification System

The application includes a simple toast notification system built with [Sonner](https://sonner.emilkowal.ski/) that supports Persian (RTL) messages and matches the application's design system.

### Features

- **Persian Language Support**: All messages are in Persian with RTL text direction
- **Authentication Feedback**: Success and error messages for login/logout operations
- **Welcome Messages**: Personalized welcome toast when users access their dashboard
- **Design System Integration**: Matches the app's dark theme and color palette

### Usage

#### Basic Usage

```typescript
import { toast } from "sonner";

// Success message
toast.success("با موفقیت وارد شدید");

// Error message
toast.error("خطا در ورود. لطفاً دوباره تلاش کنید");

// Custom message with description
toast.success(`سلام، ${userName}! 👋`, {
  description: "به داشبورد خود خوش آمدید",
  duration: 4000,
});
```

#### Current Implementation

The toast system is currently used in:

1. **Welcome Message** (`HelloPage.tsx`): Shows a personalized welcome toast when users first load their dashboard
2. **Login Success/Error** (`SignInForm.tsx`): Shows success message on successful login/signup and error messages for failed attempts
3. **Logout Success/Error** (`SignOutButton.tsx`): Shows success message on logout and error message if logout fails

### Configuration

The toast system is configured in `src/App.tsx` with RTL support and custom styling:

```typescript
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

### Styling

Custom styles are defined in `src/index.css` to match the application's design system with:
- Dark theme colors (`#06202F` background)
- RTL text direction
- Persian font family (Vazirmatn)
- Color-coded borders for different toast types
- Custom action button styling

### Future Usage

To add toast notifications to new features:

```typescript
import { toast } from "sonner";

// For success operations
toast.success("عملیات با موفقیت انجام شد");

// For errors
toast.error("خطا در انجام عملیات");

// For warnings
toast.warning("توجه: تغییرات ذخیره نشده‌ای دارید");

// For information
toast.info("اطلاعات جدید موجود است");
```

## 🎨 Design Guidelines

### For Future Development

When adding new components or features, follow these design system guidelines:

#### Colors
```css
/* Use these Tailwind classes */
bg-background        /* #06202F - Main background */
bg-background-light  /* #0a2840 - Secondary background */
text-accent          /* #ff701a - Orange text/buttons */
bg-accent            /* #ff701a - Orange background */
text-gray-300        /* Light gray text */
text-gray-200        /* Lighter gray text */
```

#### RTL Considerations
- Use `pl-4 pr-4` instead of `px-4` for padding
- Use `text-right` for text alignment
- Consider RTL when positioning elements
- Test with Persian text content

#### Component Styling
- Use `.auth-input-field` for form inputs
- Use `.auth-button` for primary buttons
- Maintain consistent spacing with `gap-4`, `gap-6`
- Use `rounded-lg` for containers, `rounded` for buttons

#### Typography
- Use `text-accent` for headings and important text
- Use `text-gray-300` for secondary text
- Use `text-gray-200` for labels
- Maintain proper font weights: `font-semibold`, `font-bold`

## 🔧 Configuration Files

### Tailwind Config (`tailwind.config.js`)
- Custom color palette defined
- Vazirmatn font family configured
- Dark mode enabled
- RTL support configured

### CSS (`src/index.css`)
- Vazirmatn font import
- RTL direction set
- Custom component classes
- Dark theme base styles

### HTML (`index.html`)
- Persian language attribute (`lang="fa"`)
- RTL direction (`dir="rtl"`)
- Custom title

## 📱 Responsive Design

The application is built with mobile-first responsive design:
- Breakpoints follow Tailwind's default system
- Components adapt to different screen sizes
- Touch-friendly button sizes and spacing

## 🌐 Internationalization

- **Language**: Persian (Farsi)
- **Direction**: RTL (Right-to-Left)
- **Date Format**: Persian locale (`fa-IR`)
- **Font**: Vazirmatn for optimal Persian text rendering

## 🚀 Deployment

This project is connected to the Convex deployment named [`precious-horse-758`](https://dashboard.convex.dev/d/precious-horse-758).

For production deployment:
1. Follow [Convex deployment guide](https://docs.convex.dev/production/)
2. Ensure environment variables are set
3. Test RTL functionality in production
4. Verify Persian font loading

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vazirmatn Font](https://github.com/rastikerdar/vazirmatn)
- [React RTL Support](https://reactjs.org/docs/internationalization.html)

## 🤝 Contributing

When contributing to this project:
1. Follow the established design system
2. Maintain RTL support
3. Use Persian translations
4. Test with Persian content
5. Follow the color palette guidelines
6. Ensure responsive design

---

**Note**: This application is designed specifically for Persian users with RTL text direction. All new features should maintain this design consistency.
