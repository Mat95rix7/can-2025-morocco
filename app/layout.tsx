import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CAN 2025 - Suivi en temps réel',
  description: 'Suivez tous les matchs, classements et statistiques de la Coupe d\'Afrique des Nations 2025',
   manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-32.png",
    apple: "/icons/icon-180.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className='dark'>
      <body className={inter.className} >
        <Header />
        <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
          {children}
        </main>
      </body>
    </html>
  );
}
