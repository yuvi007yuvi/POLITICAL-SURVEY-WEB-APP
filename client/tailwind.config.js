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
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#9af5de",
          300: "#5fe9cb",
          400: "#2dd4b3",
          500: "#14b89a",
          600: "#0d947e",
          700: "#0f7667",
          800: "#115e53",
          900: "#134e45",
          950: "#022c26"
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#050914"
        }
      },
      boxShadow: {
        premium: "0 20px 50px -12px rgba(15, 23, 42, 0.08), 0 10px 20px -8px rgba(15, 23, 42, 0.04)",
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.05)",
        "glass-dark": "0 8px 32px 0 rgba(15, 23, 42, 0.05)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      keyframes: {
        pulseGrow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        'pulse-grow': 'pulseGrow 4s ease-in-out infinite',
        'blob': "blob 7s infinite",
      }
    }
  },
  plugins: []
};
