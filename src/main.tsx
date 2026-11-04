import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './lib/context';
import App from './App';
import './styles.css';
import './parent-experience.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
