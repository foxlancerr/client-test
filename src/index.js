import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { BrowserRouter as Router } from "react-router-dom";
import { DataProvider } from "./contexts/DataProvider.js";
import { AuthProvider } from "./contexts/AuthProvider.js";
import { UserProvider } from "./contexts/UserDataProvider.js";
import { AddressProvider } from "./contexts/AddressProvider.js";
import { makeServer } from "./server.js";


if (process.env.NODE_ENV === "development") {
  makeServer(); // ✅ Required to start Mirage
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <DataProvider>
          <UserProvider>
            <AddressProvider>
              <App />
            </AddressProvider>
          </UserProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
