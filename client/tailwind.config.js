/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./main.jsx",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./services/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./utils/**/*.{js,jsx}",
    "./layouts/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8f7",
          100: "#d9ebe7",
          500: "#1f6f66",
          700: "#12453f",
          900: "#0d2623"
        },
        accent: "#e6b84a"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
