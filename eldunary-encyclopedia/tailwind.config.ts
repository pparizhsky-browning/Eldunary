import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        lora: ['Lora', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#12121A',
          elevated: '#1A1A25',
        },
        text: {
          primary: '#E8E6E3',
          secondary: '#9A9A9A',
          muted: '#5A5A6A',
        },
        border: {
          subtle: '#2A2A35',
        },
        link: {
          DEFAULT: '#C49B5C',
          hover: '#E8C476',
        },
        accent: {
          tharnex: '#2D5A27',
          darkmane: '#4A2D6B',
          goldhelm: '#C9A84C',
          golems: '#6B6B6B',
          ipadoras: '#1A7A7A',
          sharkai: '#2C4A6E',
          folkwynd: '#8B7355',
          arashi: '#DC143C',
          pegasus: '#3A6B9F',
          rose: '#8B0030',
          butterfly: '#6B4FA0',
          rooks: '#8B2500',
          ace: '#1A1A1A',
          vacron: '#8B5E3C',
          fodon: '#C4A35A',
          akison: '#8B0000',
          frada: '#4A6741',
          iyhago: '#7A6BAE',
          oredsy: '#5A7A8B',
          nikolem: '#5A5A5A',
          ipadora: '#1A7A7A',
        },
        crimson: '#DC143C',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'particle-drift': 'particle-drift 20s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'particle-drift': {
          '0%': { transform: 'translateY(100vh) translateX(0px)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-100px) translateX(50px)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'accent': '0 0 20px var(--accent, #C9A84C33)',
        'glow': '0 0 40px var(--accent, #C9A84C22)',
        'card': '0 4px 24px rgba(0,0,0,0.6)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#E8E6E3',
            a: {
              color: '#C49B5C',
              '&:hover': { color: '#E8C476' },
            },
            headings: { color: '#E8E6E3' },
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
