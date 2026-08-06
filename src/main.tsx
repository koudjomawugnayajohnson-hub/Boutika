import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { seedMockData, resetMockDatabase } from './infrastructure/mock/MockDatabase';

seedMockData();

// Expose for E2E tests
if (import.meta.env.DEV) {
  (window as any).resetMockDatabase = () => {
    resetMockDatabase();
    seedMockData();
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
