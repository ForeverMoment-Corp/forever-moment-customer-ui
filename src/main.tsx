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
import { SESSION_EVENT, startSessionKeepAlive, type SessionEventDetail } from '@/features/auth/session';
import { logout, openLoginModal, tokenRefreshed } from '@/features/auth/store/authSlice';

registerImageServiceWorker();

applyTheme();

// Keep the login alive, and mirror refreshes / an ended session into the store.
window.addEventListener(SESSION_EVENT, (e) => {
  const { token, promptLogin } = (e as CustomEvent<SessionEventDetail>).detail;
  if (token) {
    store.dispatch(tokenRefreshed(token));
    return;
  }
  if (!store.getState().auth.isAuthenticated) return;
  store.dispatch(logout());
  // Expired rather than logged out on purpose: offer to sign straight back in.
  if (promptLogin) store.dispatch(openLoginModal());
});
startSessionKeepAlive();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
