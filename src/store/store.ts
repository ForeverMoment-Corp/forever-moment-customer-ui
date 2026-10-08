import { configureStore } from '@reduxjs/toolkit';
import { homeReducer } from '@/features/home/store/reducer';
import { headerReducer } from '@/features/header/store/reducer';
import { sliderReducer } from '@/features/slider/store/reducer';
import { experiencesReducer } from '@/features/experiences/store/reducer';
import { whyChooseUsReducer } from '@/features/whyChooseUs/store/reducer';
import testimonialsReducer from '@/features/testimonials/store/reducer';
import { configReducer } from '@/store/config/reducer';
import { authReducer } from '@/features/auth/store/authSlice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    header: headerReducer,
    slider: sliderReducer,
    experiences: experiencesReducer,
    whyChooseUs: whyChooseUsReducer,
    testimonials: testimonialsReducer,
    config: configReducer as any,
    auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
