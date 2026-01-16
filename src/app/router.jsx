// src/app/router.jsx
import React from "react";
import { useLocation, useRoutes } from "react-router-dom";

import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

import AdoptPage from "@/pages/AdoptPage";
import PetDetailsPage from "@/pages/PetDetailsPage";
import AdoptionApplicationPage from "@/pages/AdoptionApplicationPage";

import ShopPage from "@/pages/Shop";
import ShopDetails from "@/pages/ShopDetails";

import CartPage from "@/pages/CartPage";
import OrdersPage from "@/pages/OrdersPage";

import MyAdoptionRequestsPage from "@/pages/MyAdoptionRequestsPage";
import AdoptionRequestDetailsPage from "@/pages/AdoptionRequestDetailsPage";

import BoardingPage from "@/pages/BoardingPage";
import MyBoardingReservationsPage from "@/pages/MyBoardingReservationsPage";
import BoardingReservationDetailsPage from "@/pages/BoardingReservationDetailsPage";

// ✅ Appointments (User)
import MyAppointmentsPage from "@/pages/MyAppointmentsPage";
import MyAppointmentDetailsPage from "@/pages/MyAppointmentDetailsPage";

// ✅ NEW: Medical Care landing page (Overview + Book dialog)
import MedicalCarePage from "@/pages/MedicalCarePage";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },

      { path: "pets", element: <AdoptPage /> },
      { path: "pets/:id/apply", element: <AdoptionApplicationPage /> },

      { path: "shop", element: <ShopPage /> },
      { path: "shop/:id", element: <ShopDetails /> },

      { path: "cart", element: <CartPage /> },
      { path: "orders", element: <OrdersPage /> },

      { path: "adoption-requests", element: <MyAdoptionRequestsPage /> },
      { path: "adoption-requests/:id", element: <AdoptionRequestDetailsPage /> },

      { path: "boarding", element: <BoardingPage /> },
      { path: "my-boarding-reservations", element: <MyBoardingReservationsPage /> },
      { path: "my-boarding-reservations/:id", element: <BoardingReservationDetailsPage /> },

      // ✅ Medical Care (Overview + Book)
      { path: "medical-care", element: <MedicalCarePage /> },

      // ✅ My Appointments
      { path: "my-appointments", element: <MyAppointmentsPage /> },
      { path: "my-appointments/:id", element: <MyAppointmentDetailsPage /> },
    ],
  },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];

export function AppRouter() {
  const location = useLocation();
  const background = location.state?.background;

  const element = useRoutes(routes, background || location);

  const modal = useRoutes(
    [
      { path: "/pets/:id", element: <PetDetailsPage /> },
      { path: "*", element: null },
    ],
    location
  );

  return (
    <>
      {element}
      {background ? modal : null}
    </>
  );
}
