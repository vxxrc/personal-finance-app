/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tickertape-inspired neutral grays
        neutral: {
          5: '#151e28',
          10: '#1e2834',
          20: '#2f363f',
          30: '#373f48',
          40: '#535b62',
          50: '#81878c',
          60: '#bdc3cb',
          70: '#d1d5db',
          80: '#e2e5e9',
          85: '#f1f4f8',
          90: '#f9fafc',
          100: '#ffffff',
        },
        // Brand colors
        brand: {
          green: '#19AF55',
          red: '#D82F44',
          blue: '#0088EA',
          purple: '#624BFF',
        },
      },
      boxShadow: {
        'flat': '0 1px 2px 0 rgba(0,0,0,0.06)',
        'raised': '0 3px 12px 0 rgba(0,0,0,0.06)',
        'overlay': '0 6px 12px 0 rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  plugins: [],
}
