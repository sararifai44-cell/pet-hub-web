// src/features/boarding/boardingApiSlice.js
import { apiSlice } from "@/app/apiSlice";

const pickSingle = (res) => res?.data ?? res;

export const boardingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /api/boarding-services
    getBoardingServices: builder.query({
      query: () => ({
        url: "boarding-services",
        method: "GET",
      }),
      providesTags: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        return [
          { type: "BoardingService", id: "LIST" },
          ...list.map((x) => ({ type: "BoardingService", id: x.id })),
        ];
      },
    }),

    // ✅ POST /api/boarding/quote
    getBoardingQuote: builder.mutation({
      query: (payload) => ({
        url: "boarding/quote",
        method: "POST",
        body: payload,
      }),
      transformResponse: (res) => pickSingle(res),
    }),

    // ✅ GET /api/my/boarding-reservations?page=1
    getMyBoardingReservations: builder.query({
      query: ({ page = 1 } = {}) => ({
        url: `my/boarding-reservations?page=${page}`,
        method: "GET",
      }),
      providesTags: (res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        return [
          { type: "BoardingReservation", id: "LIST" },
          ...list.map((x) => ({ type: "BoardingReservation", id: x.id })),
        ];
      },
    }),

    // ✅ GET /api/my/boarding-reservations/:id
    getMyBoardingReservation: builder.query({
      query: (id) => ({
        url: `my/boarding-reservations/${id}`,
        method: "GET",
      }),
      transformResponse: (res) => pickSingle(res),
      providesTags: (res, err, id) => [{ type: "BoardingReservation", id }],
    }),

    // ✅ POST /api/my/boarding-reservations
    createBoardingReservation: builder.mutation({
      query: (payload) => ({
        url: "my/boarding-reservations",
        method: "POST",
        body: payload,
      }),
      transformResponse: (res) => pickSingle(res),
      invalidatesTags: [{ type: "BoardingReservation", id: "LIST" }],
    }),

    // ✅ POST /api/my/boarding-reservations/:id/cancel
    cancelBoardingReservation: builder.mutation({
      query: (id) => ({
        url: `my/boarding-reservations/${id}/cancel`,
        method: "POST",
      }),
      transformResponse: (res) => pickSingle(res),
      invalidatesTags: (res, err, id) => [
        { type: "BoardingReservation", id: "LIST" },
        { type: "BoardingReservation", id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBoardingServicesQuery,
  useGetBoardingQuoteMutation,
  useGetMyBoardingReservationsQuery,
  useGetMyBoardingReservationQuery,
  useCreateBoardingReservationMutation,
  useCancelBoardingReservationMutation,
} = boardingApiSlice;
