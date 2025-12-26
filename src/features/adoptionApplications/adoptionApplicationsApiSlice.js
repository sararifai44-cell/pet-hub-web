import { apiSlice } from "@/app/apiSlice";

const pickSingle = (res) => res?.data ?? res;

export const adoptionApplicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ POST /api/my/adoption-applications
    createAdoptionApplication: builder.mutation({
      query: ({ pet_id, motivation }) => ({
        url: "my/adoption-applications",
        method: "POST",
        body: { pet_id, motivation },
      }),
      transformResponse: (res) => pickSingle(res),
      invalidatesTags: [{ type: "AdoptionApplication", id: "LIST" }],
    }),

    // (اختياري لاحقاً) GET /api/my/adoption-applications
    getMyAdoptionApplications: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: `my/adoption-applications?page=${page}`,
        method: "GET",
      }),
      providesTags: [{ type: "AdoptionApplication", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateAdoptionApplicationMutation,
  useGetMyAdoptionApplicationsQuery,
} = adoptionApplicationsApiSlice;
