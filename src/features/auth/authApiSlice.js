// src/features/auth/authApiSlice.js
import { apiSlice, setToken, clearToken } from "@/app/apiSlice";

const extractToken = (res) =>
  res?.token ??
  res?.access_token ??
  res?.data?.token ??
  res?.data?.access_token ??
  null;

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (payload) => ({
        url: "register",
        method: "POST",
        body: payload,
      }),
    }),

    login: builder.mutation({
      query: (payload) => ({
        url: "login",
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = extractToken(data);
          if (token) setToken(token, { remember: !!arg?.remember });
        } catch {
          /* ignore */
        }
      },
    }),

    logout: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          clearToken();
          dispatch(apiSlice.util.resetApiState());
        } catch {
          clearToken();
        }
      },
    }),

    logoutLocal: builder.mutation({
      queryFn: async () => {
        clearToken();
        return { data: { ok: true } };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useLogoutLocalMutation,
} = authApiSlice;
