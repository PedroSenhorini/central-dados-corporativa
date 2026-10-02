/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1220',
          soft: '#1B2536',
          border: '#28334A',
        },
        canvas: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#EAEAEC',
        primary: {
          DEFAULT: '#2454E0',
          soft: '#E8EEFE',
          hover: '#1B41B8',
        },
        accent: {
          DEFAULT: '#0EA5A5',
          soft: '#E1F7F5',
          hover: '#0B8484',
        },
        warning: '#F59E0B',
        success: '#16A34A',
        ink2: '#18181B',
        muted: '#71717A',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(24, 24, 27, 0.04)',
      },
    },
  },
  plugins: [],
};
