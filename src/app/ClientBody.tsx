"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always render the layout structure to prevent hydration mismatches and layout shifts
  // Next.js handles the body tag injection correctly via the RootLayout
  return (
    <body className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <AuthProvider>
        <Navbar />
        <main className="flex-grow w-full relative animate-fade-in flex flex-col">
          {children}
        </main>
        <Footer />
      </AuthProvider>
    </body>
  );
}
