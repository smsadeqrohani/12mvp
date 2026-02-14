/**
 * YekDo Design System - Color Guide
 * Use these colors anywhere in the app for consistent styling.
 *
 * Blue: Primary backgrounds, inactive states
 * Yellow: Active tab, accents, CTAs
 * Rosegold: Special accents
 */

export const COLORS = {
  // Blue palette - backgrounds, inactive tabs
  blue: {
    900: "#07193D",
    800: "#00297A",
    700: "#0036A3",
    600: "#0044CC",
    500: "#0055FE",
    400: "#3377FF",
    300: "#5C92FF",
    200: "#7FA6F5",
    100: "#C2D6FF",
  },

  // Yellow palette - active tab, accents, CTAs
  yellow: {
    900: "#AD4B00",
    800: "#C25400",
    700: "#D65D00",
    600: "#EB6600",
    500: "#FF6F00",
    400: "#FF7B14",
    300: "#FF923D",
    200: "#FFA966",
    100: "#FFC08F",
  },

  // Rosegold palette - special accents
  rosegold: {
    500: "#7A3A0F",
    400: "#A35521",
    300: "#D67F45",
    200: "#E0A075",
    100: "#F5BA93",
  },

  // Navbar specific
  navbar: {
    background: "#07193D",
    active: "#FF7B14", // yellow-400 - gold for selected tab
    inactive: "#5C92FF", // blue-300 - light blue for inactive tabs
  },
} as const;
