export const env = {
    appMode: process.env.NEXT_PUBLIC_APP_MODE as 'sandbox' | 'production' | undefined,
    // Base URL of the API server. Falls back to local dev; set in the deploy env.
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
};
