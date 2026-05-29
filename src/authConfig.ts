import { PublicClientApplication, type Configuration } from "@azure/msal-browser";
import { getRuntimeConfig } from "./runtimeConfig";

export interface AuthRuntimeConfig {
  clientId: string;
  authority: string;
  apiScope: string;
}

export const getAuthRuntimeConfig = (): AuthRuntimeConfig | undefined => {
  const config = getRuntimeConfig();

  if (!config.authClientId || !config.authAuthority || !config.authApiScope) {
    return undefined;
  }

  return {
    clientId: config.authClientId,
    authority: config.authAuthority,
    apiScope: config.authApiScope,
  };
};

export const createMsalInstance = (auth: AuthRuntimeConfig) => {
  const authorityHost = new URL(auth.authority).host;
  const configuration: Configuration = {
    auth: {
      clientId: auth.clientId,
      authority: auth.authority,
      knownAuthorities: [authorityHost],
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: "localStorage",
    },
  };

  return new PublicClientApplication(configuration);
};
