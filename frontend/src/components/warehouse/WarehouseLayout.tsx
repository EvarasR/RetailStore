import React from 'react';
import { WarehouseSidebar } from './WarehouseSidebar';
import { WarehouseTopbar } from './WarehouseTopbar';
import '../../styles/operations.css';

interface WarehouseLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const WarehouseLayout: React.FC<WarehouseLayoutProps> = ({ title, children }) => {
  return (
    <div className="ops-app-container">
      <WarehouseSidebar />
      <div className="ops-main">
        <WarehouseTopbar title={title} />
        <main className="ops-content">{children}</main>
      </div>
    </div>
  );
};
