# 12 MVP - Persian RTL Application

A modern Persian (Farsi) application built with React, TypeScript, and Convex backend, featuring RTL (Right-to-Left) support and a custom dark theme design system.

## 🎨 Design System

### Color Palette
- **Primary Background**: `#0a3651` (Dark Blue)
- **Secondary Background**: `#0f4a6b` (Lighter Blue)
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

## 🎨 Design Guidelines

### For Future Development

When adding new components or features, follow these design system guidelines:

#### Colors
```css
/* Use these Tailwind classes */
bg-background        /* #0a3651 - Main background */
bg-background-light  /* #0f4a6b - Secondary background */
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
