// src/app/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
const API_URL = RAW_API_URL.replace(/\/+$/, "") + "/";

// ✅ كوكي خاصة بالويب فقط
export const WEB_TOKEN_KEY = "pethub_web_token";

// (اختياري) مفاتيح قديمة للتنظيف مرة واحدة
const LEGACY_KEYS = ["token", "access_token"];

export const getToken = () => {
  const token = Cookies.get(WEB_TOKEN_KEY);
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

// ✅ دعم remember (جلسة أو 30 يوم)
export const setToken = (token, { remember = false } = {}) => {
  if (!token) return;

  const options = {
    sameSite: "lax",
    secure: false,
    path: "/",
  };

  if (remember) options.expires = 30;

  Cookies.set(WEB_TOKEN_KEY, token, options);
};

export const clearToken = () => {
  Cookies.remove(WEB_TOKEN_KEY, { path: "/" });

  // ✅ تنظيف مفاتيح قديمة لتجنب أي خربطة/كود قديم
  for (const k of LEGACY_KEYS) {
    Cookies.remove(k, { path: "/" });
  }
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = getToken();

    const lang =
      localStorage.getItem("lang") ||
      (navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en");

    headers.set("Accept", "application/json");
    headers.set("Accept-Language", lang);

    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const res = await rawBaseQuery(args, api, extraOptions);

  if (res?.error?.status === 401) {
    clearToken();
  }

  return res;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "User",
    "Pet",
    "Product",
    "Cart",
    "CartItem",
    "Order",
    "ProductCategory",
    "AdoptionApplication",
    "BoardingReservation",
    "BoardingService",
  ],
  endpoints: () => ({}),
});
