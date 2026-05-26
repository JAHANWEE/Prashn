import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

/**
 * Get the API base URL for tRPC calls.
 * In development: http://localhost:8000/trpc
 * In production: configured via NEXT_PUBLIC_API_URL
 */
function getBaseUrl(): string {
  const apiUrl = env.NEXT_PUBLIC_API_URL;
  if (apiUrl) return `${apiUrl}/trpc`;
  return "http://localhost:8000/trpc";
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const linkFn = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return linkFn({
    url: getBaseUrl(),
    async headers() {
      const headers: Record<string, string> = {};

      // In browser context, get Clerk token from cookie/session
      if (typeof window !== "undefined") {
        try {
          // @ts-expect-error — Clerk exposes this on window after initialization
          const token = await window.Clerk?.session?.getToken();
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
        } catch {
          // No auth token available — public request
        }
      }

      return headers;
    },
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
