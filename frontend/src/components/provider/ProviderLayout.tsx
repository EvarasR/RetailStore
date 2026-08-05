import React from 'react';
import { ProviderSidebar } from './ProviderSidebar';
import { ProviderTopbar } from './ProviderTopbar';
import '../../styles/provider.css';

interface ProviderLayoutProps {
  title: string;
  razonSocial?: string;
  children: React.ReactNode;
}

export const ProviderLayout: React.FC<ProviderLayoutProps> = ({
  title,
  razonSocial,
  children,
}) => {
  return (
    <div className="prov-app-container">
      <ProviderSidebar />
      <div className="prov-main">
        <ProviderTopbar title={title} razonSocial={razonSocial} />
        <main className="prov-content">{children}</main>
      </div>
    </div>
  );
};
