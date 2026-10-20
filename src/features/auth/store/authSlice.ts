import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { storage, setLoginSession, removeLoginSession } from '@/utils/storage';
import axios from '@/utils/Http';
import { googleSignOut } from '../googleIdentity';
import { revokeSession, tokenClaims } from '../session';
import { identifyUser, clearUser, trackLogin, trackLogout } from '@/lib/analytics';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

export interface AuthState {
  isLoginModalOpen: boolean;
  /** "Are you sure you want to log out?" popup (LogoutConfirmModal). */
  isLogoutConfirmOpen: boolean;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Who the token belongs to. The login responses don't reliably carry the user id (email login sends
 * only email + tokens), but the token always does: `userId` is exactly what the gateway forwards as
 * X-User-Id, so bookings / payments / reviews must use it.
 */
function identityFrom(token: string | null | undefined, payload: Record<string, any> = {}) {
  const claims = tokenClaims(token);
  return {
    id: claims.userId ?? payload.userId ?? payload.id,
    role: claims.roles || payload.roles || 'USER',
    email: payload.email || claims.username,
  };
}

const token = storage.getToken();
const storedUser = storage.getUser();
// Sessions saved before the id came from the token may lack it: fill it in.
const user = storedUser && token ? { ...storedUser, ...identityFrom(token, storedUser), email: storedUser.email || tokenClaims(token).username } : storedUser;
if (user && user !== storedUser) storage.setUser(user);

const initialState: AuthState = {
  isLoginModalOpen: false,
  isLogoutConfirmOpen: false,
  isAuthenticated: !!token,
  user: user,
  token: token,
  status: 'idle',
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/user/profile');
      if (response.data && response.data.code === 200) {
        return response.data.response;
      }
      return rejectWithValue('Failed to load profile');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await axios.put('/user/profile', profileData);
      if (response.data && response.data.code === 200) {
        return response.data.response || profileData;
      }
      return rejectWithValue('Failed to update profile');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to update profile');
    }
  }
);

/** DELETE /user/profile?confirmPassword= — permanently deletes the account, then signs out. */
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (confirmPassword: string | undefined, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete('/user/profile', { params: confirmPassword ? { confirmPassword } : undefined });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Could not delete your account');
    }
    googleSignOut();
    dispatch(logout());
  }
);

/** POST /user/profile/deactivate — switches the account off (it can be reactivated by support), then signs out. */
export const deactivateAccount = createAsyncThunk(
  'auth/deactivateAccount',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axios.post('/user/profile/deactivate');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || error.response?.data?.message || 'Could not deactivate your account');
    }
    await revokeSession();
    googleSignOut();
    dispatch(logout());
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      // Revokes the refresh token (the endpoint expects it, not the access token).
      await revokeSession();
    } finally {
      // Tell Google too, or its "Continue as <name>" button stays in a stale auto-select state.
      googleSignOut();
      dispatch(logout());
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
    openLogoutConfirm: (state) => {
      state.isLogoutConfirmOpen = true;
    },
    closeLogoutConfirm: (state) => {
      state.isLogoutConfirmOpen = false;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      
      const identity = identityFrom(payload.token, payload);
      const newUser = {
        ...identity,
        name: payload.fullName || payload.name || '',
      };

      // Store in local storage
      storage.setToken(payload.token);
      if (payload.refreshToken) {
        setLoginSession('refresh_token', payload.refreshToken);
      }
      storage.setUser(newUser);

      // Update state
      state.isAuthenticated = true;
      state.user = newUser;
      state.token = payload.token;
      state.isLoginModalOpen = false; // close modal on success

      // Analytics: identify the user and record login method.
      // The method is stored on the payload by the dispatching code; fallback to 'email'.
      if (newUser.id) identifyUser(newUser.id);
      trackLogin((payload._analyticsMethod as 'email' | 'google' | 'phone') ?? 'email');
    },
    /** A refreshed access token (features/auth/session). */
    tokenRefreshed: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (state.user) {
        const { id, role } = identityFrom(action.payload, state.user);
        state.user = { ...state.user, id, role };
        storage.setUser(state.user);
      }
    },
    logout: (state) => {
      storage.clearToken();
      storage.clearUser();
      removeLoginSession('refresh_token');

      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLogoutConfirmOpen = false;

      // Analytics: clear user identity and record the logout.
      clearUser();
      trackLogout();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      const profile = action.payload;
      if (profile && state.user) {
        state.user = {
          ...state.user,
          ...profile,
          name: profile.fullName || profile.name || state.user.name,
        };
        storage.setUser(state.user);
      }
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      const profile = action.payload;
      if (profile && state.user) {
        state.user = {
          ...state.user,
          ...profile,
          name: profile.fullName || profile.name || state.user.name,
          phone: profile.phoneNumber || state.user.phone,
          location: profile.preferredCity || state.user.location,
        };
        storage.setUser(state.user);
      }
    });
  }
});

export const { openLoginModal, closeLoginModal, openLogoutConfirm, closeLogoutConfirm, loginSuccess, logout, tokenRefreshed } = authSlice.actions;
export const authReducer = authSlice.reducer;
