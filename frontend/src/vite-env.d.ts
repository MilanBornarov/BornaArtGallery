/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PUBLIC_FACEBOOK_LINK: string;
  readonly VITE_PUBLIC_INSTAGRAM_LINK: string;
  readonly VITE_PUBLIC_PHONE_LINK: string;
  readonly VITE_PUBLIC_PHONE_DISPLAY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
