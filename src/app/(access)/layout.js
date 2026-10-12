import '@app/_assets/variables.css';
import '@app/_assets/globals.css';
import { abcOracle } from '@app/_assets/fonts/abcOracle';
import { SITE_NAME } from '@/lib/siteUrl';

// Root layout of the preview password gate: none of the site chrome
// (menu, radio, page transitions), which would only load for nothing.
export const metadata = {
  title: `Private Preview | ${SITE_NAME}`,
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function AccessLayout({ children }) {
  return (
    <html lang="en" className={abcOracle.variable} suppressHydrationWarning>
      {/* hydrated: globals.css keeps the body hidden until this class is set */}
      <body className="hydrated" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
