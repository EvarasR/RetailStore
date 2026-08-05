import React from 'react';
import { SupportSidebar } from './SupportSidebar';
import { SupportTopbar } from './SupportTopbar';
import '../../styles/operations.css';

interface SupportLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const SupportLayout: React.FC<SupportLayoutProps> = ({ title, children }) => {
  return (
    <div className="ops-app-container">
      <SupportSidebar />
      <div className="ops-main">
        <SupportTopbar title={title} />
        <main className="ops-content">{children}</main>
      </div>
    </div>
  );
};
