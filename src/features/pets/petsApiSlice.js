// src/features/pets/petsApiSlice.js
import { apiSlice } from "@/app/apiSlice";

const asArray = (res) => (Array.isArray(res?.data) ? res.data : []);
const pickData = (res) =>
  res && typeof res === "object" && "data" in res ? res.data : res;

export const petsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /api/pets?page=1
    getPets: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: `pets`,
        method: "GET",
        params: { page },
      }),
      providesTags: (result) => {
        const list = asArray(result);
        return [
          { type: "Pet", id: "LIST" },
          ...list.map((p) => ({ type: "Pet", id: p.id })),
        ];
      },
    }),

    getPetById: builder.query({
      query: (id) => ({
        url: `pets/${id}`,
        method: "GET",
      }),
      transformResponse: (res) => pickData(res),
      providesTags: (_r, _e, id) => [{ type: "Pet", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPetsQuery, useGetPetByIdQuery } = petsApiSlice;
