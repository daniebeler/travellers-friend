/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        toilet: "var(--color-toilet)",
        water: "var(--color-water)",
        bike: "var(--color-bike)",
        atm: "var(--color-atm)",
        tabletennis: "var(--color-tabletennis)",
        fitness: "var(--color-fitness)",
      },
    },
  },
};
