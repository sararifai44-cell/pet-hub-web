import React from "react";
import { useLocation, useRoutes } from "react-router-dom";

import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

import AdoptPage from "@/pages/AdoptPage";
import PetDetailsPage from "@/pages/PetDetailsPage";
import AdoptionApplicationPage from "@/pages/AdoptionApplicationPage"; // ✅ NEW

import ShopPage from "@/pages/Shop";
import ShopDetails from "@/pages/ShopDetails";

import CartPage from "@/pages/CartPage";
import OrdersPage from "@/pages/OrdersPage";

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // ✅ list page
      { path: "pets", element: <AdoptPage /> },

      // ✅ NEW: application page
      { path: "pets/:id/apply", element: <AdoptionApplicationPage /> },

      { path: "shop", element: <ShopPage /> },
      { path: "shop/:id", element: <ShopDetails /> },

      { path: "cart", element: <CartPage /> },
      { path: "orders", element: <OrdersPage /> },
    ],
  },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];

export function AppRouter() {
  const location = useLocation();
  const background = location.state?.background;

  const element = useRoutes(routes, background || location);

  // ✅ modal routes (فقط لما يكون في background)
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
