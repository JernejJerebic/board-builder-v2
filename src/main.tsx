
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BasketProvider } from './context/BasketContext.tsx';

createRoot(document.getElementById("root")!).render(
  <BasketProvider>
    <App />
  </BasketProvider>
);
