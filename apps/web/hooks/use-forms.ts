"use client";

import { trpc } from "~/trpc/client";

/**
 * Hook to fetch the current user's forms list.
 */
export function useForms(options?: { status?: string; page?: number; limit?: number }) {
  return trpc.forms.list.useQuery({
    status: options?.status as any,
    page: options?.page ?? 1,
    limit: options?.limit ?? 20,
  });
}

/**
 * Hook to fetch a single form by ID.
 */
export function useForm(formId: string) {
  return trpc.forms.getById.useQuery({ formId });
}

/**
 * Hook to fetch the current user's profile.
 */
export function useMe() {
  return trpc.auth.me.useQuery();
}

/**
 * Hook to create a new form.
 */
export function useCreateForm() {
  const utils = trpc.useUtils();
  return trpc.forms.create.useMutation({
    onSuccess: () => {
      utils.forms.list.invalidate();
    },
  });
}

/**
 * Hook to publish a form.
 */
export function usePublishForm() {
  const utils = trpc.useUtils();
  return trpc.forms.publish.useMutation({
    onSuccess: () => {
      utils.forms.list.invalidate();
    },
  });
}

/**
 * Hook to fetch analytics overview for a form.
 */
export function useAnalyticsOverview(formId: string) {
  return trpc.analytics.overview.useQuery({ formId });
}

/**
 * Hook to fetch analytics timeline for a form.
 */
export function useAnalyticsTimeline(formId: string, days?: number) {
  return trpc.analytics.timeline.useQuery({ formId, days: days ?? 7 });
}
