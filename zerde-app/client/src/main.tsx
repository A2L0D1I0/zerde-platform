import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Safety check: If no valid token exists, purge stale cache immediately
if (!localStorage.getItem('zerde_token')) {
  localStorage.removeItem('zerde_user');
  localStorage.removeItem('zerde_role');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
