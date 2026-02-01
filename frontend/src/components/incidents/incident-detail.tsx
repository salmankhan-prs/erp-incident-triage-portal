import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "./severity-badge";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { useIncident, useUpdateIncident } from "@/hooks/useIncidents";
import { ApiRequestError } from "@/services/api";
import { STATUSES, type Status } from "@/types";
import {
  ArrowLeft,
  Loader2,
  Lightbulb,
  FileText,
  AlertCircle,
  WifiOff,
  RefreshCw,
  Sparkles,
  Wrench,
} from "lucide-react";

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: incident,
    isLoading,
    error,
    refetch,
  } = useIncident(id || "");

  const updateMutation = useUpdateIncident();

  const handleStatusChange = (newStatus: Status) => {
    if (!id) return;
    updateMutation.mutate({ id, input: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading incident...</p>
      </div>
    );
  }

  if (error || !incident) {
    const apiError = error instanceof ApiRequestError ? error : null;
    const isNetworkError = apiError?.code === "NETWORK_ERROR";
    const isNotFound = apiError?.code === "NOT_FOUND";
    const errorMessage = apiError?.message ?? "Incident not found";

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
            {isNotFound
              ? "Incident Not Found"
              : isNetworkError
                ? "Connection Error"
                : "Failed to Load"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {errorMessage}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Incidents
          </Button>
          {!isNotFound && (
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to incidents
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{incident.title}</h1>
          <p className="text-muted-foreground">ID: {incident.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="mt-1 whitespace-pre-wrap">{incident.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ERP Module
                </p>
                <p className="mt-1">{incident.erpModule}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Environment
                </p>
                <p className="mt-1">{incident.environment}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Business Unit
                </p>
                <p className="mt-1">{incident.businessUnit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Category
                </p>
                <div className="mt-1">
                  <CategoryBadge category={incident.category} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Created</p>
                <p>{new Date(incident.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Updated</p>
                <p>{new Date(incident.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Analysis
              </span>
              <Badge
                variant={
                  incident.enrichmentSource === "ai" ? "default" : "secondary"
                }
                className="gap-1"
              >
                {incident.enrichmentSource === "ai" ? (
                  <>
                    <Sparkles className="h-3 w-3" />
                    AI Enriched
                  </>
                ) : (
                  <>
                    <Wrench className="h-3 w-3" />
                    Auto Enriched
                  </>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incident.enrichmentSource === "fallback" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                OpenAI was not available. This incident was classified using
                rule-based heuristics.
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Summary
              </p>
              <p className="mt-1">{incident.summary}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Suggested Action
              </p>
              <p className="mt-1 p-3 bg-muted rounded-md">
                {incident.suggestedAction}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Severity
                </p>
                <div className="mt-1">
                  <SeverityBadge severity={incident.severity} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Category
                </p>
                <div className="mt-1">
                  <CategoryBadge category={incident.category} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={incident.status}
              onValueChange={(value) => handleStatusChange(value as Status)}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updateMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
          {updateMutation.isError && (
            <p className="text-sm text-destructive mt-2">
              Failed to update status. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
