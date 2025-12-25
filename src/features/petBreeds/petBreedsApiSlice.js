// src/features/petBreeds/petBreedsApiSlice.js
import { apiSlice } from "@/app/apiSlice";

const asArray = (res) => (Array.isArray(res?.data) ? res.data : []);

export const petBreedsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /api/pet-breeds
    getPetBreeds: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: "pet-breeds",
        method: "GET",
        params: { page },
      }),
      transformResponse: (res) => ({
        data: asArray(res),
        meta: res?.meta,
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data) ? result.data : [];
        return [
          { type: "PetBreed", id: "LIST" },
          ...list.map((b) => ({ type: "PetBreed", id: b.id })),
        ];
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetPetBreedsQuery } = petBreedsApiSlice;
