import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#333',
        background: '#fff',
        foreground: '#333',
        primary: {
          DEFAULT: '#1D6EC1',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#F6F6F7',
          foreground: '#333'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fff'
        },
        muted: {
          DEFAULT: '#F6F6F7',
          foreground: '#8E9196'
        },
        accent: {
          DEFAULT: '#F1F1F1',
          foreground: '#403E43'
        },
        popover: {
          DEFAULT: '#fff',
          foreground: '#333'
        },
        card: {
          DEFAULT: '#fff',
          foreground: '#333'
        },
        sidebar: {
          DEFAULT: '#f8f9fa',
          foreground: '#333',
          primary: '#1D6EC1',
          'primary-foreground': '#fff',
          accent: '#F1F1F1',
          'accent-foreground': '#403E43',
          border: '#e2e8f0',
          ring: '#1D6EC1'
        }
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'rotate-board': {
          from: {
            transform: 'rotateZ(0deg)'
          },
          to: {
            transform: 'rotateZ(90deg)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'rotate-board': 'rotate-board 0.3s ease-out forwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
