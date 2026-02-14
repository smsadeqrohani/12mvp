/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    fontFamily: {
      sans: ["Vazirmatn-Regular", "system-ui", "sans-serif"],
      body: ["Vazirmatn-Regular", "system-ui", "sans-serif"],
    },
    extend: {
      fontFamily: {
        regular: ["Vazirmatn-Regular"],
        medium: ["Vazirmatn-Medium"],
        semibold: ["Vazirmatn-SemiBold"],
        bold: ["Vazirmatn-Bold"],
      },
      colors: {
        primary: {
          DEFAULT: "#06202F",
          hover: "#051a26",
        },
        secondary: {
          DEFAULT: "#06202F",
          hover: "#051a26",
        },
        accent: {
          DEFAULT: "#ff701a",
          hover: "#e55a00",
        },
        background: {
          DEFAULT: "#06202F",
          light: "#0a2840",
        },
        // YekDo login design (Figma node 320-605)
        "blue-900": "#07193D",
        "blue-accent": "#3B82F6",
        "form-card": "rgba(15, 35, 80, 0.95)",
        "input-field": "rgba(30, 58, 110, 0.8)",
        // YekDo color guide - full palette
        "yekdo-blue": {
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
        "yekdo-yellow": {
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
        "yekdo-navbar": {
          bg: "#07193D",
          active: "#FF7B14",
          inactive: "#5C92FF",
        },
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
    },
  },
  plugins: [],
}
