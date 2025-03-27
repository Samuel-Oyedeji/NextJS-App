// src/app/layout.tsx
import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/ThemeContext';
import ClientLayout from '@/components/ClientLayout'; // Add this import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RealSocial - Real Estate Social Network',
  description: 'Connect, share, and discover real estate properties',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col`}>
        <ThemeProvider>
          <ClientLayout>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-right" toastOptions={{ className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100' }} />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}