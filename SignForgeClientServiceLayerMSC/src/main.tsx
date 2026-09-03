import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import PWAService from './Services/PWAService';

// Initialize PWA Service Worker & Install Prompt Listeners
PWAService.current.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
