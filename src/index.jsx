import React from "react";
import { createRoot } from "react-dom/client";
import "regenerator-runtime/runtime";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App/App";
import { ConfigProvider, theme } from "antd";
import { Provider as ReduxProvider } from "react-redux";

import store from "./store";

import "styles/global.scss";
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#3EE8B5",
      },
      algorithm: theme.darkAlgorithm,
    }}
  >
    <ReduxProvider store={store}>
      <Router>
        <App />
      </Router>
    </ReduxProvider>
  </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.info))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
