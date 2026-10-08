import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  isLoginModalOpen: boolean;
}

const initialState: AuthState = {
  isLoginModalOpen: false,
};

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
  },
});

export const { openLoginModal, closeLoginModal } = authSlice.actions;
export const authReducer = authSlice.reducer;
