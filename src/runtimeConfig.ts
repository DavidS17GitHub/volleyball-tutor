interface RuntimeConfig {
  azureVideoBaseUrl?: string;
  lessonsMetadataUrl?: string;
  authClientId?: string;
  authAuthority?: string;
  authApiScope?: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

const valueOrUndefined = (value: string | undefined) => {
  if (!value?.trim()) {
    return undefined;
  }

  return value;
};

export const getRuntimeConfig = (): RuntimeConfig => ({
  azureVideoBaseUrl: valueOrUndefined(window.__APP_CONFIG__?.azureVideoBaseUrl),
  lessonsMetadataUrl: valueOrUndefined(window.__APP_CONFIG__?.lessonsMetadataUrl),
  authClientId:
    valueOrUndefined(window.__APP_CONFIG__?.authClientId) ??
    valueOrUndefined(import.meta.env.VITE_AUTH_CLIENT_ID),
  authAuthority:
    valueOrUndefined(window.__APP_CONFIG__?.authAuthority) ??
    valueOrUndefined(import.meta.env.VITE_AUTH_AUTHORITY),
  authApiScope:
    valueOrUndefined(window.__APP_CONFIG__?.authApiScope) ??
    valueOrUndefined(import.meta.env.VITE_AUTH_API_SCOPE),
});
