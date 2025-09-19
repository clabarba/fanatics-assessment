import './globals.css';
import Header from '@/components/Header';
import { ClerkProvider } from '@clerk/nextjs';
import { Bitcount } from 'next/font/google';
import { Toaster } from 'sonner';


// Load Bitcount Sans and Mono
const bitcountSans = Bitcount({
  variable: '--font-bitcount',
  subsets: ['latin'],
  weight: ['400'], // or 'variable' if using all weights
  style: ['normal'],
  display: 'swap',
});

const bitcountMono = Bitcount({
  variable: '--font-bitcount-mono',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal'],
  display: 'swap',
});

export const metadata = {
  title: 'Christopher La Barba - Fanatics Assessment',
  description: 'A project to showcase my skills in full stack development',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${bitcountSans.variable} ${bitcountMono.variable}`}>
        <body className="font-sans antialiased">
          <Header />
          {children}
          <Toaster/>
        </body>
      </html>
    </ClerkProvider>
  );
}
