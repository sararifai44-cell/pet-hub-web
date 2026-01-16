// src/features/appointments/appointmentsApiSlice.js
import { apiSlice } from "@/app/apiSlice";

export const appointmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ LIST: GET /my/appointments?page=1&per_page=15
    getMyAppointments: builder.query({
      query: ({ page = 1, per_page = 15 } = {}) =>
        `my/appointments?page=${page}&per_page=${per_page}`,
      providesTags: (result) => {
        const list = result?.data ?? [];
        return [
          { type: "Appointment", id: "MY_LIST" },
          ...list.map((a) => ({ type: "Appointment", id: a.id })),
        ];
      },
    }),

    // ✅ SHOW: GET /my/appointments/:id
    getMyAppointmentById: builder.query({
      query: (id) => `my/appointments/${id}`,
      providesTags: (result, err, id) => [{ type: "Appointment", id }],
    }),

    // ✅ CREATE: POST /my/appointments
    createMyAppointment: builder.mutation({
      query: (body) => ({
        url: "my/appointments",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Appointment", id: "MY_LIST" }],
    }),

    // ✅ CANCEL: POST /my/appointments/:id/cancel
    cancelMyAppointment: builder.mutation({
      query: (id) => ({
        url: `my/appointments/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (result, err, id) => [
        { type: "Appointment", id },
        { type: "Appointment", id: "MY_LIST" },
      ],
    }),

    // ✅ Categories (WEB): GET /appointment-categories
    getAppointmentCategories: builder.query({
      query: () => "appointment-categories",
      providesTags: (result) => {
        const list = result?.data ?? [];
        return [
          { type: "AppointmentCategory", id: "LIST" },
          ...list.map((c) => ({ type: "AppointmentCategory", id: c.id })),
        ];
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyAppointmentsQuery,
  useGetMyAppointmentByIdQuery,
  useCreateMyAppointmentMutation,
  useCancelMyAppointmentMutation,
  useGetAppointmentCategoriesQuery,
} = appointmentsApiSlice;
