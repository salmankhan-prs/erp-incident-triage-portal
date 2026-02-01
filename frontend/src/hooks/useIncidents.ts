import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
} from "@/services/api";
import type {
  CreateIncidentInput,
  UpdateIncidentInput,
  Status,
  Severity,
  ErpModule,
} from "@/types";

/**
 * Filter parameters for listing incidents
 */
export interface IncidentFilters {
  status?: Status;
  severity?: Severity;
  module?: ErpModule;
}

/**
 * Query keys for cache management
 */
export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters: IncidentFilters) =>
    [...incidentKeys.lists(), filters] as const,
  details: () => [...incidentKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
};

/**
 * Hook for fetching incidents with pagination
 */
export function useIncidentList(filters: IncidentFilters = {}) {
  return useInfiniteQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: ({ pageParam }) =>
      listIncidents({
        ...filters,
        limit: 9,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

/**
 * Hook for fetching a single incident
 */
export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => getIncident(id),
    enabled: !!id,
  });
}

/**
 * Hook for creating an incident
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIncidentInput) => createIncident(input),
    onSuccess: () => {
      // Invalidate all incident lists to refetch
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}

/**
 * Hook for updating an incident
 */
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIncidentInput }) =>
      updateIncident(id, input),
    onSuccess: (updatedIncident) => {
      // Update the specific incident in cache
      queryClient.setQueryData(
        incidentKeys.detail(updatedIncident.id),
        updatedIncident
      );
      // Invalidate lists to reflect status change
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
    },
  });
}
