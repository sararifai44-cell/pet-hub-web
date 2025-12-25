import { apiSlice } from "@/app/apiSlice";

const pickDataArray = (res) => (Array.isArray(res?.data) ? res.data : []);
const pickSingle = (res) => res?.data ?? res;

const normalizeProduct = (p) => {
  if (!p) return null;

  const imagesRaw =
    (Array.isArray(p.images) && p.images) ||
    (Array.isArray(p.media) && p.media) ||
    (p.image ? [p.image] : []) ||
    (p.image_url ? [p.image_url] : []);

  const images = (imagesRaw || [])
    .map((x) => (typeof x === "string" ? x : x?.url || x?.path))
    .filter(Boolean);

  return {
    id: p.id,
    name_en: p.name_en ?? "",
    name_ar: p.name_ar ?? "",
    description: p.description ?? "",
    price: Number(p.price ?? 0),

    // ✅ المعتمد بالباك
    stock_quantity: Number(p.stock_quantity ?? 0),

    is_active: !!p.is_active,
    category: p.category ?? null,
    images,
  };
};

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/products?page=1
    getProducts: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: `products?page=${page}`,
        method: "GET",
      }),
      transformResponse: (res) => {
        const list = pickDataArray(res).map(normalizeProduct);
        return { ...res, data: list };
      },
      providesTags: (result) => {
        const list = pickDataArray(result);
        return [
          { type: "Product", id: "LIST" },
          ...list.map((p) => ({ type: "Product", id: p.id })),
        ];
      },
    }),

    // ✅ GET /api/products/:id
    getProductById: builder.query({
      query: (id) => ({
        url: `products/${id}`,
        method: "GET",
      }),
      transformResponse: (res) => normalizeProduct(pickSingle(res)),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productsApiSlice;
