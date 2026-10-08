const env = import.meta.env;

export const API_URL: string = (env.VITE_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
export const STORE_NAME: string = env.VITE_STORE_NAME ?? "Meridian";
export const SHOW_ADMIN: boolean = env.VITE_SHOW_ADMIN === "true";
export const STRIPE_TEST_HINT: boolean = env.VITE_STRIPE_TEST_HINT === "true";
