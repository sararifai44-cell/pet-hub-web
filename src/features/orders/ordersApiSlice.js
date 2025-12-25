import { apiSlice } from "@/app/apiSlice";

const asArray = (res) => (Array.isArray(res?.data) ? res.data : []);

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query({
      query: () => ({ url: "my/orders", method: "GET" }),
      providesTags: (result) => [
        { type: "Order", id: "LIST" },
        ...asArray(result).map((o) => ({ type: "Order", id: o.id })),
      ],
    }),

    createOrder: builder.mutation({
      query: () => ({ url: "my/orders", method: "POST" }),
      invalidatesTags: [
        { type: "Order", id: "LIST" },
        { type: "Cart", id: "CURRENT" },
      ],
    }),
  }),
});

export const { useGetMyOrdersQuery, useCreateOrderMutation } = ordersApiSlice;
