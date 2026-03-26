const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        montecarlo: ['"MonteCarlo"', 'sans-serif'], // Déclarez la police ici
        'times': ['"Times New Roman"', 'serif'],
    },
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}

