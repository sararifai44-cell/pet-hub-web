import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./apiSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefault) =>
    getDefault({
      // تعطيل فحص الحالات الكبيرة لتجنب بطء المتصفح في بيئة التطوير
      immutableCheck: false,
      serializableCheck: false,
    }).concat(apiSlice.middleware),
  devTools: true, // اختياري: لضمان عمل Redux DevTools بشكل جيد
});

setupListeners(store.dispatch);
