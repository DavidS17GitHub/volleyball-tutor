import React from "react";
import ReactDOM from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { App } from "./App";
import { AuthenticatedApp } from "./AuthenticatedApp";
import { createMsalInstance, getAuthRuntimeConfig } from "./authConfig";
import "./styles.css";

async function startApp() {
  const auth = getAuthRuntimeConfig();
  const root = ReactDOM.createRoot(document.getElementById("root")!);

  if (!auth) {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    return;
  }

  const msalInstance = createMsalInstance(auth);
  await msalInstance.initialize();

  root.render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <AuthenticatedApp auth={auth} />
      </MsalProvider>
    </React.StrictMode>,
  );
}

void startApp();
