import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AppRouter } from './routes/AppRouter';
import { useTheme } from './hooks/useTheme';
import './styles/marketplace.css';

export const App: React.FC = () => {
  // Inicializa el sistema de temas (sincronizando localStorage con el DOM)
  useTheme();

  return (
    <BrowserRouter>
      <AppShell>
        <AppRouter />
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
