import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#020617', // slate-950
          surface: '#0f172a', // slate-900
        },
        accent: {
          purple: {
            DEFAULT: '#a855f7', // purple-600
            light: '#c084fc', // purple-400
            dark: '#7e22ce', // purple-700
          },
          green: {
            DEFAULT: '#10b981', // emerald-500
            light: '#34d399', // emerald-400
            dark: '#059669', // emerald-600
          },
        },
        text: {
          DEFAULT: '#f1f5f9', // slate-100
          muted: '#94a3b8', // slate-400
        },
        border: {
          DEFAULT: 'rgba(168, 85, 247, 0.3)', // purple-500/30
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-lg': '0 0 30px rgba(168, 85, 247, 0.6)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
