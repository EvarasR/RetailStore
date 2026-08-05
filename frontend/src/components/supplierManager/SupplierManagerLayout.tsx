import React from 'react';
import { SupplierManagerSidebar } from './SupplierManagerSidebar';
import { SupplierManagerTopbar } from './SupplierManagerTopbar';
import '../../styles/operations.css';

interface SupplierManagerLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const SupplierManagerLayout: React.FC<SupplierManagerLayoutProps> = ({ title, children }) => {
  return (
    <div className="ops-app-container">
      <SupplierManagerSidebar />
      <div className="ops-main">
        <SupplierManagerTopbar title={title} />
        <main className="ops-content">{children}</main>
      </div>
    </div>
  );
};
