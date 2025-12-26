// src/features/Products/productsApiSlice.js
import { apiSlice } from "@/app/apiSlice";

const pickDataArray = (res) => (Array.isArray(res?.data) ? res.data : []);
const pickSingle = (res) => res?.data ?? res;

const normalizeProduct = (p) => {
  if (!p) return null;

  // ✅ صور من الباك فقط
  const imagesRaw =
    (Array.isArray(p.images) && p.images) ||
    (Array.isArray(p.media) && p.media) ||
    [];

  const images = (imagesRaw || [])
    .map((x) => (typeof x === "string" ? x : x?.url || x?.path))
    .filter(Boolean);

  // ✅ cover_image موجود بالـindex
  const cover = p?.cover_image || null;

  // ✅ خلي cover أول شي
  const allImages = [cover, ...images].filter(Boolean);

  // ✅ remove duplicates
  const uniqImages = Array.from(new Set(allImages));

  return {
    id: p.id,

    name_en: p.name_en ?? "",
    name_ar: p.name_ar ?? "",
    description: p.description ?? "",
    price: Number(p.price ?? 0),

    stock_quantity: Number(p.stock_quantity ?? 0),
    is_active: !!p.is_active,

    // ✅ مهمين للفلاتر
    category: p.category ?? null,
    pet_type: p.pet_type ?? null,

    // ✅ للـUI
    cover_image: cover,
    images: uniqImages, // array of url strings
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

    // GET /api/products/:id
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
