import React from 'react';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <PublicHeader />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);
