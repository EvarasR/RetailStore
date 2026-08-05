import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import '../../styles/admin.css';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => {
  return (
    <div className="admin-app-container">
      <AdminSidebar />
      <div className="admin-main-area">
        <AdminTopbar title={title} />
        <main className="admin-content-body">{children}</main>
      </div>
    </div>
  );
};
