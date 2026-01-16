// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css"; // Tailwind v4
import { store } from "./app/store.js";

// استيراد مزود المحرك الخاص بـ MUI
import { StyledEngineProvider } from "@mui/material/styles";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <StyledEngineProvider injectFirst>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StyledEngineProvider>
  </React.StrictMode>
);