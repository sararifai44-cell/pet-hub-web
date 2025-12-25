// src/features/petTypes/petTypesApiSlice.js
import { apiSlice } from "@/app/apiSlice";

const asArray = (res) => (Array.isArray(res?.data) ? res.data : []);

export const petTypesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /api/pet-types
    getPetTypes: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: "pet-types",
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
          { type: "PetType", id: "LIST" },
          ...list.map((t) => ({ type: "PetType", id: t.id })),
        ];
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetPetTypesQuery } = petTypesApiSlice;
