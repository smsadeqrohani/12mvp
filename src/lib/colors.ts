/**
 * YekDo Design System - Color Guide
 * Use these colors anywhere in the app for consistent styling.
 *
 * Import: import { COLORS } from "@/src/lib/colors"
 * Usage: COLORS.blue[700], COLORS.yellow[500], etc.
 *
 * Blue: Primary backgrounds, borders, inactive states
 * Yellow: Active tab, accents, CTAs
 * Neutral: Text, grays, surfaces
 * Rosegold: Special accents
 * Green: Success states
 * Red: Error, danger states
 */

export const COLORS = {
  blue: {
    900: "#07193D",
    800: "#00297A",
    700: "#073BA3",
    600: "#1854CC",
    500: "#1257E0",
    400: "#3172F5",
    300: "#588CF5",
    200: "#7FA6F5",
    100: "#C2D6FF",
  },

  yellow: {
    900: "#7A5E0A",
    800: "#A37D0D",
    700: "#B88D0F",
    600: "#E0AE1B",
    500: "#F0BB1D",
    400: "#F5C431",
    300: "#FFE085",
    200: "#FFF0C2",
    100: "#FFFAEB",
  },

  neutral: {
    500: "#2E333D",
    400: "#5D677A",
    300: "#9AA4B8",
    200: "#C5CEE0",
    100: "#FFFFFF",
  },

  rosegold: {
    500: "#7A3A0F",
    400: "#A35521",
    300: "#D67F45",
    200: "#E0A075",
    100: "#F5BA93",
  },

  green: {
    500: "#0A520A",
    400: "#0F7A0F",
    300: "#139E13",
    200: "#08CC08",
    100: "#5CFF5C",
  },

  red: {
    500: "#8F2211",
    400: "#B82B16",
    300: "#D63A22",
    200: "#FF6047",
    100: "#FF9585",
  },

  // Convenience aliases for common use
  navbar: {
    background: "#07193D", // blue.900
    active: "#F5C431", // yellow.400
    inactive: "#588CF5", // blue.300
  },
} as const;
