import { useState } from "react";
import { IncidentCard } from "./incident-card";
import { IncidentFilters } from "./incident-filters";
import { Button } from "@/components/ui/button";
import { useIncidentList, type IncidentFilters as Filters } from "@/hooks/useIncidents";
import { ApiRequestError } from "@/services/api";
import { Loader2, AlertCircle, RefreshCw, WifiOff } from "lucide-react";

export function IncidentList() {
  const [filters, setFilters] = useState<Filters>({});

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useIncidentList(filters);

  // Flatten all pages into a single array
  const incidents = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading incidents...</p>
      </div>
    );
  }

  if (error) {
    const apiError = error instanceof ApiRequestError ? error : null;
    const isNetworkError = apiError?.code === "NETWORK_ERROR";
    const errorMessage = apiError?.message ?? "An unexpected error occurred";

    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="rounded-full bg-destructive/10 p-3">
          {isNetworkError ? (
            <WifiOff className="h-6 w-6 text-destructive" />
          ) : (
            <AlertCircle className="h-6 w-6 text-destructive" />
          )}
        </div>
        <div className="text-center">
          <p className="font-medium text-destructive">
            {isNetworkError ? "Connection Error" : "Failed to Load Incidents"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {errorMessage}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Incidents ({total})</h2>
      </div>

      <IncidentFilters filters={filters} onFilterChange={handleFilterChange} />

      {incidents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No incidents found</p>
          {Object.keys(filters).length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
