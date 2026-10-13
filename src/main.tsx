import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent harmless user-cancelled Web Share or AbortError from bubbling as uncaught errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason?.name === 'AbortError' ||
      (typeof reason?.message === 'string' &&
        (reason.message.toLowerCase().includes('cancel') ||
         reason.message.toLowerCase().includes('abort')))
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
