// src/features/notifications/notificationsApiSlice.js
import { apiSlice } from "@/app/apiSlice";

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /notifications?page=1&per_page=10
    getNotifications: builder.query({
      query: ({ page = 1, per_page = 10 } = {}) =>
        `notifications?page=${page}&per_page=${per_page}`,
      providesTags: (result) => {
        const list = result?.data ?? [];
        return [
          { type: "Notification", id: "LIST" },
          { type: "Notification", id: "UNREAD_COUNT" },
          ...list.map((n) => ({ type: "Notification", id: n.id })),
        ];
      },
    }),

    // GET /notifications/unread-count
    getUnreadCount: builder.query({
      query: () => `notifications/unread-count`,
      providesTags: [{ type: "Notification", id: "UNREAD_COUNT" }],
    }),

    // POST /notifications/:id/read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `notifications/${id}/read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
      ],
    }),

    // POST /notifications/read-all
    markAllAsRead: builder.mutation({
      query: () => ({
        url: `notifications/read-all`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApiSlice;
