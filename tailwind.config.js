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
