import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { openLoginModal } from '../store/authSlice';

/**
 * Wraps an action that needs a signed-in user. Guests get the login popup instead,
 * and the action is skipped.
 *
 *   const requireAuth = useRequireAuth();
 *   onClick={() => requireAuth(() => onToggleLike(id))}
 */
export function useRequireAuth() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  return useCallback(
    (action?: () => void) => {
      if (!isAuthenticated) {
        dispatch(openLoginModal());
        return false;
      }
      action?.();
      return true;
    },
    [dispatch, isAuthenticated]
  );
}
