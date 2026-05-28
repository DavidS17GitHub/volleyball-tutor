import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { LogIn, LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { App } from "./App";
import type { AuthRuntimeConfig } from "./authConfig";

interface AuthenticatedAppProps {
  auth: AuthRuntimeConfig;
}

export function AuthenticatedApp({ auth }: AuthenticatedAppProps) {
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
        <p className="eyebrow">Premium access</p>
        <h1>Sign in to start training</h1>
        <p>Your progress and lesson access are tied to your account.</p>
        {authError ? <p className="error-text">{authError}</p> : null}
        <button className="primary-action action-with-icon" onClick={handleSignIn} type="button">
          <LogIn size={18} />
          Sign in
        </button>
      </main>
    );
  }

  return (
    <>
      <div className="account-bar">
        <span>{account.name ?? account.username}</span>
        <button className="text-action" onClick={handleSignOut} type="button">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      <App getAccessToken={getAccessToken} />
    </>
  );
}
