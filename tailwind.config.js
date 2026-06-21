/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrainsMono_400Regular'],
        cursive: ['EduNSWACTCursive_400Regular'],
        'cursive-bold': ['EduNSWACTCursive_700Bold'],
        bebas: ['BebasNeue_400Regular'],
        inter: ['Inter_400Regular'],
        'inter-light': ['Inter_300Light'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
