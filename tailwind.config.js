/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vert eucalyptus — couleur dominante
        brand: {
          50:  '#f2f7f5',
          100: '#ddeee7',
          200: '#bdddd1',
          300: '#91c4b1',
          400: '#61a58e',
          500: '#3f8a73',
          600: '#2e6f5c',
          700: '#265a4b',
          800: '#20483d',
          900: '#1b3c33',
          950: '#0e221d',
        },
        // Vert menthe — call to action
        accent: {
          50:  '#f0faf5',
          100: '#d9f2e6',
          200: '#b3e5cd',
          300: '#7dcfaa',
          400: '#4ab885',
          500: '#2ea86d',
          600: '#1f8f59',
          700: '#197248',
          800: '#165a3a',
          900: '#124a30',
        },
        surface: {
          50:  '#f5f8f6',
          100: '#edf3ef',
          800: '#1a2820',
          900: '#101d16',
          950: '#080f0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(63,138,115,0.28), transparent)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
