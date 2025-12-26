import { apiSlice } from "@/app/apiSlice";

export const productCategoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductCategories: builder.query({
      query: ({ page = 1 } = {}) => `product-categories?page=${page}`,
      providesTags: (res) =>
        res?.data
          ? [
              ...res.data.map((c) => ({ type: "ProductCategory", id: c.id })),
              { type: "ProductCategory", id: "LIST" },
            ]
          : [{ type: "ProductCategory", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProductCategoriesQuery } = productCategoriesApiSlice;
