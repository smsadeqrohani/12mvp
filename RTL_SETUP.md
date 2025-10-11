# RTL (Right-to-Left) Setup for Mobile App

## Overview
This document describes the RTL configuration implemented for the 12 MVP mobile application to ensure proper right-to-left layout for Persian/Farsi text.

## Changes Made

### 1. Root Layout Configuration (`app/_layout.tsx`)
- Added `Platform` import to detect mobile vs web
- Updated RTL initialization with `I18nManager.allowRTL(true)` and `I18nManager.forceRTL(true)`
- Added explicit `direction: 'rtl'` style to the root View for mobile platforms
- RTL is now only forced on native platforms (iOS/Android), not web

### 2. App Configuration (`app.config.js`)
- **iOS**: Added `CFBundleDevelopmentRegion: "fa"` and `CFBundleAllowMixedLocalizations: true`
- **Android**: Added `supportsRtl: true` to enable RTL support at the native level

### 3. Global Styles (`global.css`)
- Added base layer directive to apply RTL direction to all elements
- Added RTL-aware utility classes for common use cases
- Enhanced RTL-specific utilities

### 4. RTL Utility Library (`src/lib/rtl.ts`)
New utility functions for RTL handling:
- `isRTL()`: Check if app is in RTL mode
- `getFlexDirection()`: Get proper flex direction for RTL
- `getTextAlign()`: Get proper text alignment for RTL
- `getDirectionStyle()`: Get direction style object
- `transformRTL()`: Transform style properties for RTL (swap left/right)
- `getIconTransform()`: Get icon flip transform for RTL

### 5. RTL View Component (`src/components/ui/RTLView.tsx`)
A wrapper component that ensures proper RTL direction on Views:
- Automatically applies RTL direction on native platforms
- Supports `row` and `column` props for flex direction
- Can be used as a drop-in replacement for `View` when RTL is needed

## Important: First-Time Setup

### For Native Platforms (iOS/Android)

**⚠️ CRITICAL: After these changes, you MUST restart the app completely**

The first time you run the app after enabling RTL, you need to:

1. **Stop the Metro bundler** (Ctrl+C in the terminal)
2. **Clear the cache**: `npx expo start --clear`
3. **For iOS**: 
   - Delete the app from the simulator/device
   - Run `cd ios && pod install && cd ..` (if using bare workflow)
   - Reinstall the app
4. **For Android**:
   - Delete the app from the emulator/device  
   - Clear the app data
   - Reinstall the app

### Why is this necessary?

React Native's `I18nManager.forceRTL(true)` requires a **complete app restart** to take effect. On the first run after setting this flag, the app needs to reload to apply the RTL layout direction to all native components.

## Testing RTL

To verify RTL is working correctly:

1. **Launch the app** after following the setup steps above
2. **Check navigation**: The tab bar and navigation elements should be right-aligned
3. **Check text**: All Persian text should align to the right
4. **Check layouts**: Flex-row elements should reverse (right-to-left)
5. **Check icons**: Directional icons (like chevrons) should point in the correct direction

## Usage Examples

### Using RTL Utilities

```typescript
import { isRTL, getFlexDirection, transformRTL } from '../lib/rtl';

// Check RTL status
const rtl = isRTL();

// Get flex direction
const flexDir = getFlexDirection('row'); // Returns 'row-reverse' in RTL

// Transform styles
const styles = transformRTL({ 
  marginLeft: 10,  // Becomes marginRight: 10 in RTL
  paddingRight: 5  // Becomes paddingLeft: 5 in RTL
});
```

### Using RTLView Component

```tsx
import { RTLView } from '../components/ui';

// Instead of:
<View style={{ flexDirection: 'row' }}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>

// Use:
<RTLView row>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</RTLView>
```

## Common Issues and Solutions

### Issue: Layouts still appear LTR
**Solution**: Make sure you've completely restarted the app (see First-Time Setup above)

### Issue: Some components not respecting RTL
**Solution**: 
- Check if you're using inline styles that override RTL
- Use the `RTLView` component instead of regular `View` for flex layouts
- Use RTL utility functions for dynamic styles

### Issue: Icons pointing wrong direction
**Solution**: Use `getIconTransform()` utility:
```tsx
<Icon style={getIconTransform(true)} />
```

### Issue: Text alignment is wrong
**Solution**: Explicitly set text alignment:
- Use `text-right` className for RTL text
- Or use `getTextAlign()` utility

## Web vs Mobile

- **Web**: RTL is handled via CSS `direction: rtl` in `src/index.css`
- **Mobile**: RTL is handled via `I18nManager.forceRTL(true)` in `app/_layout.tsx`

The codebase automatically detects the platform and applies the appropriate method.

## Additional Resources

- [React Native RTL Documentation](https://reactnative.dev/docs/i18nmanager)
- [Expo RTL Support](https://docs.expo.dev/guides/localization/#rtl-support)
- [NativeWind RTL](https://www.nativewind.dev/guides/rtl)

## Troubleshooting Commands

```bash
# Clear all caches and restart
npx expo start --clear

# Reset Metro bundler
rm -rf node_modules/.cache
npx expo start --clear

# For iOS (bare workflow)
cd ios && pod install && cd ..

# For Android, clear build cache
cd android && ./gradlew clean && cd ..
```

## Notes

- RTL support is enabled by default for all users
- The app will detect and apply RTL automatically based on `I18nManager` settings
- Web version uses CSS direction, mobile uses native RTL
- All new components should use RTL-aware utilities when dealing with directional layouts

