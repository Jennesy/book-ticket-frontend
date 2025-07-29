import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  safelist: [
    'bg-green-200',
    'bg-red-200',
    'bg-gray-200',
    'bg-blue-800',
    'bg-purple-800',
    'bg-green-300',
    'bg-green-400',
    'bg-lightblue-300',
    'bg-lightblue-400',
    'bg-orange-300',
    'bg-orange-400',
    'bg-yellow-300',
    'bg-yellow-400',
    'bg-red-300',
    'bg-red-400',
    'bg-slate-400',
    'bg-pink-400',
    'text-gray-200',
    'filter', 
    'brightness-75',
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#04CFD6',
        dark: '#00AAB7',
        light: '#AAEBEC',
      },
      secondary: {
        DEFAULT: '#FCEB78',
        dark: '#f8d03b',
        light: '#fef6c4',
      },
      gray: {
        DEFAULT: '#767676',
        light: '#D2D2D2',
        text: {
          DEFAULT: '#484848',
          1: '#5E5E5E',
          2: '#7A7A7A',
        },
        1: '#F5F5F5',
        2: '#E6E6E6',
        3: '#F4F4F5',
        4: '#909399',
        5: '#FAFAFA',
        6: '#EEEEEE',
        7: '#949494',
        8: '#494847',
        9: '#484746',
        10: '#C0C4CC',
        11: '#DCDFE6',
        12: '#E5E9F2',
      },
    },
    boxShadow: {
      default: '0 2px 4px rgba(0, 0, 0, 0.05)',
      hover: '2px 2px 4px rgba(0, 0, 0, 0.20)',
      dialog: '0 0 8px rgba(0, 0, 0, 0.20)',
    },
    breakpoints: {
      'small-phone': '374px',
      'mobile': '415px',
      'tablet': '769px',
      'desktop': '1024px',
      'widescreen': '1216px',
      'full-hd': '1472px',
    },
  },
  rules: [
    ['scrollbar-thin', {
      'scrollbar-width': 'thin',
    }],
  ],
})