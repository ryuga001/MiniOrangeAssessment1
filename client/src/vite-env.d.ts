/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_TITLE: string;
    readonly VITE_AUTH_API_URI: string;
    readonly VITE_USER_API_URI:string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_FACEBOOK_APP_ID : string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
