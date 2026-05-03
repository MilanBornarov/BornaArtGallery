/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ARTIST_FACEBOOK_URL: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_PUBLIC_INSTAGRAM_LINK?: string;
  readonly VITE_PUBLIC_PHONE_LINK?: string;
  readonly VITE_PUBLIC_PHONE_DISPLAY?: string;
  readonly VITE_PUBLIC_EMAIL_LINK?: string;
  readonly VITE_PUBLIC_EMAIL_ADDRESS?: string;
  readonly VITE_INSTAGRAM_LINK?: string;
  readonly VITE_PHONE_LINK?: string;
  readonly VITE_PHONE_DISPLAY?: string;
  readonly VITE_EMAIL_LINK?: string;
  readonly VITE_EMAIL_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
