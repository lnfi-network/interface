import React from "react";
import { createRoot } from "react-dom/client";
import "regenerator-runtime/runtime";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App/App";
import { ConfigProvider, theme } from "antd";
import { Provider as ReduxProvider } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { Alert } from "antd";
import store from "./store";

import "styles/global.scss";
const container = document.getElementById("root");
const root = createRoot(container);
const logError = (error, info) => {
  console.log("🚀 ~ file: index.jsx:16 ~ logError ~ error:", error);
  // Do something with the error, e.g. log to an external API
};
function Fallback({ error, resetErrorBoundary }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return <Alert message={error.message} type="error" onClose={resetErrorBoundary}></Alert>;
}
root.render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#3EE8B5"
      },
      algorithm: theme.darkAlgorithm
    }}
  >
    <ReduxProvider store={store}>
      <Router>
        <ErrorBoundary FallbackComponent={Fallback} onError={logError}>
          <App />
        </ErrorBoundary>
      </Router>
    </ReduxProvider>
  </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.info))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
