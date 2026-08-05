import React from 'react';
import { AccountSidebar } from './AccountSidebar';

interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="tt-account-layout">
      <div className="tt-account-layout__container">
        <AccountSidebar />
        <main className="tt-account-layout__content" aria-label="Contenido principal de cuenta">
          {(title || subtitle) && (
            <header className="tt-account-layout__header">
              {title && <h1 className="tt-account-layout__title">{title}</h1>}
              {subtitle && <p className="tt-account-layout__subtitle">{subtitle}</p>}
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
