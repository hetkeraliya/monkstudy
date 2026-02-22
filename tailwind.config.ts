import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        monk: {
          dark: "#384D48",
          muted: "#6E7271",
          olive: "#ACAD94",
          sand: "#D8D4D5",
          bg: "#E2E2E2",
          card: "#FFFFFF",
          textMain: "#111827"
        }
      },
      borderRadius: {
        'card': '18px',
        'btn': '14px',
      },
      boxShadow: {
        'matte': '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
      // This defines the classes Tailwind was looking for
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        body: ['system-ui', 'sans-serif'], // Now font-body will work if you need it
      }
    },
  },
  plugins: [],
};
export default config;
