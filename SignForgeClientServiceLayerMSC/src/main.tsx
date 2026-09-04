import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import PWAService from './Services/PWAService';
import TanstackQueryClientService from './Services/TanstackQueryClientService';

// Initialize PWA Service Worker & Install Prompt Listeners
PWAService.current.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={TanstackQueryClientService.current.client}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
