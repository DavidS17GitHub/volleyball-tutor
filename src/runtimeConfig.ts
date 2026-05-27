interface RuntimeConfig {
  azureVideoBaseUrl?: string;
  lessonsMetadataUrl?: string;
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
});
