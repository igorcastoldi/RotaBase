import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RotaBase — Passeios de Aventura',
  description: 'Encontre e reserve passeios de quadriciclo, UTV e 4x4 em todo o Brasil.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans bg-stone-50 text-stone-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
