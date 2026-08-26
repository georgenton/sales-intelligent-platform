import { configureStore } from '@reduxjs/toolkit';
import { productApi } from './api';
import { productUiReducer } from './ui-slice';

export function makeStore() {
  return configureStore({
    reducer: {
      productUi: productUiReducer,
      [productApi.reducerPath]: productApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
