import { apiSlice } from "@/app/apiSlice";

const pickSingle = (res) => res?.data ?? res;

export const adoptionApplicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //  POST /api/my/adoption-applications
    createAdoptionApplication: builder.mutation({
      query: ({ pet_id, motivation }) => ({
        url: "my/adoption-applications",
        method: "POST",
        body: { pet_id, motivation },
      }),
      transformResponse: (res) => pickSingle(res),
      invalidatesTags: [{ type: "AdoptionApplication", id: "LIST" }],
    }),

    //  GET /api/my/adoption-applications?page=1
    getMyAdoptionApplications: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: `my/adoption-applications?page=${page}`,
        method: "GET",
      }),
      providesTags: (result) => {
        const arr = result?.data || [];
        return [
          { type: "AdoptionApplication", id: "LIST" },
          ...arr.map((x) => ({ type: "AdoptionApplication", id: x.id })),
        ];
      },
    }),

    //  GET /api/my/adoption-applications/:id  (show/details)
    getMyAdoptionApplicationById: builder.query({
      query: (id) => ({
        url: `my/adoption-applications/${id}`,
        method: "GET",
      }),
      transformResponse: (res) => pickSingle(res),
      providesTags: (_res, _err, id) => [{ type: "AdoptionApplication", id }],
    }),

    // إضافة ميزة الإلغاء هنا
    // POST /api/my/adoption-applications/:id/cancel
    cancelAdoptionApplication: builder.mutation({
      query: (id) => ({
        url: `my/adoption-applications/${id}/cancel`,
        method: "PATCH", // حسب الرابط الذي أرسلته
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "AdoptionApplication", id: "LIST" },
        { type: "AdoptionApplication", id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateAdoptionApplicationMutation,
  useGetMyAdoptionApplicationsQuery,
  useGetMyAdoptionApplicationByIdQuery,
  useCancelAdoptionApplicationMutation, // تصدير الـ hook الجديد
} = adoptionApplicationsApiSlice;
