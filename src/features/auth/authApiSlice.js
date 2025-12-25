// src/features/auth/authApiSlice.js
import { apiSlice, setToken, clearToken } from "@/app/apiSlice";

const extractToken = (res) => res?.data?.token ?? null;

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (payload) => ({
        url: "register",
        method: "POST",
        body: payload, // { name,email,password,password_confirmation }
      }),
    }),

    login: builder.mutation({
      query: (payload) => ({
        url: "login",
        method: "POST",
        body: payload, // { email, password }
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = extractToken(data);

          // ✅ خزّنه بالكوكيز فقط
          if (token) setToken(token);
        } catch {
          // ignore
        }
      },
    }),

    // (اختياري) لوج آوت محلي: بس يمسح كوكي التوكن
    logoutLocal: builder.mutation({
      queryFn: async () => {
        clearToken();
        return { data: { ok: true } };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useRegisterMutation, useLoginMutation, useLogoutLocalMutation } =
  authApiSlice;
