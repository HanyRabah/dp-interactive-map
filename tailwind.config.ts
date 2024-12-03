import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        meteor: {
          '0%': { 
            transform: 'translateY(0) translateX(0)',
            opacity: '1'
          },
          '80%': { opacity: '1' },
          '100%': { 
            transform: 'translateY(200vh) translateX(-100px)',
            opacity: '0'
          },
        },
      },
      animation: {
        'meteor': 'meteor linear forwards',
        'ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
