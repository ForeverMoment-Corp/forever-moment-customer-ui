import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import './styles/app.scss';
import { store } from '@/store/store';
import { router } from './router';
import { registerImageServiceWorker } from '@/lib/images';
import { applyTheme } from '@/lib/theme';

registerImageServiceWorker();

applyTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
