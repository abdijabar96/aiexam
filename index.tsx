
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './AdminApp';
import { AccessCodeGate } from './components/AccessCodeGate';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isAdminPage = window.location.pathname === '/admin';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isAdminPage ? (
      <AdminApp />
    ) : (
      <AccessCodeGate>
        <App />
      </AccessCodeGate>
    )}
  </React.StrictMode>
);
