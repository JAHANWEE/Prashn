"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useState } from "react";
import { Toaster } from "~/components/ui/sonner";
import { useAuth } from "@clerk/nextjs";
import { httpLink } from "@repo/trpc/client";

import { trpc } from "~/trpc/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/trpc`
  : "http://localhost:8000/trpc";

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();

  // QueryClient inside component state — prevents data leaking between SSR requests
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: true,
        staleTime: 30_000,
        retry: 1,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: API_URL,
          async headers() {
            try {
              const token = await getToken();
              return token ? { Authorization: `Bearer ${token}` } : {};
            } catch {
              return {};
            }
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <trpc.Provider queryClient={queryClient} client={trpcClient}>
          {children}
          <Toaster />
        </trpc.Provider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};
