import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/theme.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/recruit.css";
import "./styles/about.css";
import "./styles/project-detail.css";
import "./styles/admin.css";
import "./styles/error.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
