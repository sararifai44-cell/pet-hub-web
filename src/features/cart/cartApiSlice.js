import { apiSlice } from "@/app/apiSlice";

const getCartObj = (res) => res?.data ?? null;

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => ({ url: "cart", method: "GET" }),
      providesTags: (result) => {
        const cart = getCartObj(result);
        const items = cart?.items ?? [];
        return [
          { type: "Cart", id: "CURRENT" },
          ...items.map((it) => ({ type: "CartItem", id: it.id })),
        ];
      },
    }),

    addItemToCart: builder.mutation({
      // body: { product_id, quantity }
      query: (body) => ({ url: "cart/items", method: "POST", body }),
      invalidatesTags: [{ type: "Cart", id: "CURRENT" }],
    }),

    updateCartItem: builder.mutation({
      // body: { quantity }
      query: ({ itemId, quantity }) => ({
        url: `cart/items/${itemId}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Cart", id: "CURRENT" },
        { type: "CartItem", id: arg.itemId },
      ],
    }),

    removeCartItem: builder.mutation({
      // DELETE with body: { quantity }
      query: ({ itemId, quantity }) => ({
        url: `cart/items/${itemId}`,
        method: "DELETE",
        body: { quantity },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Cart", id: "CURRENT" },
        { type: "CartItem", id: arg.itemId },
      ],
    }),

    clearCart: builder.mutation({
      query: () => ({ url: "cart", method: "DELETE" }),
      invalidatesTags: [{ type: "Cart", id: "CURRENT" }],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddItemToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApiSlice;
