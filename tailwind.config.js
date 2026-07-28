/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // Desktop-first, max-width based breakpoint scheme (reference architecture)
    screens: {
      "2xl": { max: "1200px" },
      xl: { max: "1080px" },
      lg: { max: "992px" },
      md: { max: "768px" },
      sm: { max: "640px" },
      xs: { max: "460px" },
    },
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        "primary-light": "var(--primary-light)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        earthy: "var(--earthy)",
        background: "var(--background)",
        "background-light": "var(--background-light)",
        text: "var(--text)",
        "text-light": "var(--text-light)",
        border: "var(--border)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        muted: "var(--muted)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        accent: "var(--font-accent)",
        sans: "var(--font-sans)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};
