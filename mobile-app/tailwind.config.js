/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",      // Covers your index.tsx and _layout.tsx
    "./src/**/*.{js,jsx,ts,tsx}",      // Covers pairingScreen.tsx and socket.ts
    "./App.{js,jsx,ts,tsx}",           // Just in case you have a root App.tsx
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

