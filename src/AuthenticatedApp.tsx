import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { LogIn, LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { App } from "./App";
import type { AuthRuntimeConfig } from "./authConfig";
import { LocaleToggle } from "./components/LocaleToggle";
import { useI18n } from "./i18n";

interface AuthenticatedAppProps {
  auth: AuthRuntimeConfig;
}

export function AuthenticatedApp({ auth }: AuthenticatedAppProps) {
  const { t } = useI18n();
  const { accounts, instance } = useMsal();
  const [authError, setAuthError] = useState<string | null>(null);
  const account = accounts[0];

  const getAccessToken = useMemo(
    () => async () => {
      if (!account) {
        throw new Error("Please sign in to load lessons.");
      }

      const request = {
        account,
        scopes: [auth.apiScope],
      };

      try {
        const result = await instance.acquireTokenSilent(request);
        return result.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          await instance.acquireTokenRedirect({
            scopes: [auth.apiScope],
          });
          throw new Error("Finishing sign-in. Please wait for the page to reload.");
        }

        throw error;
      }
    },
    [account, auth.apiScope, instance],
  );

  const handleSignIn = async () => {
    setAuthError(null);

    try {
      await instance.loginRedirect({
        scopes: [auth.apiScope],
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to start sign-in.");
    }
  };

  const handleSignOut = async () => {
    await instance.logoutRedirect({
      account,
    });
  };

  if (!account) {
    return (
      <main className="center-state">
        <LocaleToggle />
        <p className="eyebrow">{t("premiumAccess")}</p>
        <h1>{t("signInToStartTraining")}</h1>
        <p>{t("userProgressAccount")}</p>
        {authError ? <p className="error-text">{authError}</p> : null}
        <button className="primary-action action-with-icon" onClick={handleSignIn} type="button">
          <LogIn size={18} />
          {t("signIn")}
        </button>
      </main>
    );
  }

  return (
    <>
      <div className="account-bar">
        <LocaleToggle />
        <span>{account.name ?? account.username}</span>
        <button className="text-action" onClick={handleSignOut} type="button">
          <LogOut size={16} />
          {t("signOut")}
        </button>
      </div>
      <App getAccessToken={getAccessToken} />
    </>
  );
}
