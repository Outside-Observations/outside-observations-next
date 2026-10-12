import localFont from 'next/font/local';

// Shared by every root layout (site pages and the preview access gate), so
// the font is declared once and served from the same files.
export const abcOracle = localFont({
  src: [
    { path: './ABCOracle-Regular.otf', weight: '400', style: 'normal' },
    { path: './ABCOracle-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: './ABCOracle-Medium.otf', weight: '500', style: 'normal' },
    { path: './ABCOracle-Bold.otf', weight: '700', style: 'normal' },
    { path: './ABCOracle-BoldItalic.otf', weight: '700', style: 'italic' },
  ],
  variable: '--font-oracle',
  display: 'swap',
});
