import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { storage, setLoginSession, removeLoginSession } from '@/utils/storage';
import axios from '@/utils/Http';

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

export interface AuthState {
  isLoginModalOpen: boolean;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const token = storage.getToken();
const user = storage.getUser();

const initialState: AuthState = {
  isLoginModalOpen: false,
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

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
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
    loginSuccess: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      
      const newUser = {
        id: payload.userId || payload.id,
        email: payload.email,
        name: payload.fullName || payload.name,
        role: payload.roles || 'USER',
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
    },
    logout: (state) => {
      storage.clearToken();
      storage.clearUser();
      removeLoginSession('refresh_token');

      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
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

export const { openLoginModal, closeLoginModal, loginSuccess, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
