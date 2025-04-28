import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
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
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#223C65'
        },
        input: {
          DEFAULT: '#e2e8f0',
          dark: '#223C65'
        },
        ring: {
          DEFAULT: '#333',
          dark: '#1D6EC1'
        },
        background: {
          DEFAULT: '#fff',
          dark: '#0A1F3C'
        },
        foreground: {
          DEFAULT: '#333',
          dark: '#E6E8EC'
        },
        primary: {
          DEFAULT: '#1D6EC1',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#F6F6F7',
          foreground: '#333',
          dark: '#122A44',
          'dark-foreground': '#ADB1B8'
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
          foreground: '#403E43',
          dark: '#142A5C',
          'dark-foreground': '#CDD0DC'
        },
        popover: {
          DEFAULT: '#fff',
          foreground: '#333',
          dark: '#0A1F3C',
          'dark-foreground': '#E6E8EC'
        },
        card: {
          DEFAULT: '#fff',
          foreground: '#333',
          dark: '#0A1F3C',
          'dark-foreground': '#E6E8EC'
        },
        sidebar: {
          DEFAULT: '#f8f9fa',
          foreground: '#333',
          primary: '#1D6EC1',
          'primary-foreground': '#fff',
          accent: '#F1F1F1',
          'accent-foreground': '#403E43',
          border: '#e2e8f0',
          ring: '#1D6EC1',
          dark: '#0E1E39',
          'dark-foreground': '#E6E8EC',
          'dark-accent': '#142A5C',
          'dark-accent-foreground': '#CDD0DC',
          'dark-border': '#223C65'
        },
        gray: {
          200: '#e5e7eb',
          700: '#374151'
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
