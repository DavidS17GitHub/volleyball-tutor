import React from "react";
import ReactDOM from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { App } from "./App";
import { AuthenticatedApp } from "./AuthenticatedApp";
import { createMsalInstance, getAuthRuntimeConfig } from "./authConfig";
import { I18nProvider } from "./i18n";
import "./styles.css";

async function startApp() {
  const auth = getAuthRuntimeConfig();
  const root = ReactDOM.createRoot(document.getElementById("root")!);

  if (!auth) {
    root.render(
      <React.StrictMode>
        <I18nProvider>
          <App />
        </I18nProvider>
      </React.StrictMode>,
    );
    return;
  }

  const msalInstance = createMsalInstance(auth);
  await msalInstance.initialize();

  root.render(
    <React.StrictMode>
      <I18nProvider>
        <MsalProvider instance={msalInstance}>
          <AuthenticatedApp auth={auth} />
        </MsalProvider>
      </I18nProvider>
    </React.StrictMode>,
  );
}

void startApp();
