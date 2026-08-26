import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Sales Intelligence Platform', template: '%s · Sales Intelligence' },
  description: 'Enterprise sales command center for predictable revenue',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          // UI-only preference; authentication and session data never touch localStorage.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('sip-appearance')||'SYSTEM';var d=m==='DARK'||(m==='SYSTEM'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
