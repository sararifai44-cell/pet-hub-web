// src/app/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
const API_URL = RAW_API_URL.replace(/\/+$/, "") + "/";

const COOKIE_TOKEN_KEYS = ["token", "access_token"];

// ✅ Cookie-only
export const getToken = () => {
  const token = Cookies.get("token") || Cookies.get("access_token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

// ✅ Cookie-only
export const setToken = (token) => {
  if (!token) return;

  Cookies.set("token", token, {
    expires: 7, // أيام
    sameSite: "lax",
    secure: false, // خليها true بالإنتاج على https
    path: "/",
  });
};

// ✅ Cookie-only
export const clearToken = () => {
  for (const k of COOKIE_TOKEN_KEYS) {
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

    // ❌ لا تفرض Content-Type دائماً
    // headers.set("Content-Type", "application/json");

    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  },
});

// ✅ لو رجع 401 → نظّف cookie token
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
  ],
  endpoints: () => ({}),
});
