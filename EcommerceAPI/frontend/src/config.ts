export const STORE_NAME = "Stockroom";

const rawApiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1").trim().replace(/\/$/, "");
export const API_URL = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;

