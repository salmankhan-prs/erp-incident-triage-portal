import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ERP_MODULES,
  ENVIRONMENTS,
  BUSINESS_UNITS,
  type CreateIncidentInput,
  type ErpModule,
  type Environment,
  type BusinessUnit,
} from "@/types";
import { useCreateIncident } from "@/hooks/useIncidents";
import { ApiRequestError } from "@/services/api";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";

export function IncidentForm() {
  const navigate = useNavigate();
  const createMutation = useCreateIncident();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateIncidentInput>({
    title: "",
    description: "",
    erpModule: "" as ErpModule,
    environment: "" as Environment,
    businessUnit: "" as BusinessUnit,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    createMutation.mutate(formData, {
      onSuccess: (incident) => {
        navigate(`/incidents/${incident.id}`);
      },
      onError: (err) => {
        if (err instanceof ApiRequestError && err.details) {
          const errors: Record<string, string> = {};
          err.details.forEach((d) => {
            errors[d.field] = d.message;
          });
          setFieldErrors(errors);
        }
      },
    });
  };

  const error = createMutation.error;
  const apiError = error instanceof ApiRequestError ? error : null;
  const isNetworkError = apiError?.code === "NETWORK_ERROR";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Report New Incident</CardTitle>
        <CardDescription>
          Submit a new ERP incident for triage. AI will automatically analyze
          and prioritize the incident.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className={`p-4 rounded-md flex items-start gap-3 ${
                isNetworkError
                  ? "bg-orange-50 dark:bg-orange-900/20"
                  : "bg-destructive/10"
              }`}
            >
              {isNetworkError ? (
                <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    isNetworkError
                      ? "text-orange-800 dark:text-orange-200"
                      : "text-destructive"
                  }`}
                >
                  {isNetworkError ? "Connection Error" : "Submission Failed"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isNetworkError
                      ? "text-orange-700 dark:text-orange-300"
                      : "text-destructive/80"
                  }`}
                >
                  {apiError?.message ?? "Failed to create incident"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the incident"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={fieldErrors.title ? "border-destructive" : ""}
            />
            {fieldErrors.title && (
              <p className="text-sm text-destructive">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the issue, including any error messages, steps to reproduce, and business impact..."
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={fieldErrors.description ? "border-destructive" : ""}
            />
            {fieldErrors.description && (
              <p className="text-sm text-destructive">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="erpModule">ERP Module *</Label>
              <Select
                value={formData.erpModule}
                onValueChange={(value) =>
                  setFormData({ ...formData, erpModule: value as ErpModule })
                }
              >
                <SelectTrigger
                  className={fieldErrors.erpModule ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {ERP_MODULES.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.erpModule && (
                <p className="text-sm text-destructive">
                  {fieldErrors.erpModule}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment *</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    environment: value as Environment,
                  })
                }
              >
                <SelectTrigger
                  className={
                    fieldErrors.environment ? "border-destructive" : ""
                  }
                >
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.environment && (
                <p className="text-sm text-destructive">
                  {fieldErrors.environment}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessUnit">Business Unit *</Label>
              <Select
                value={formData.businessUnit}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    businessUnit: value as BusinessUnit,
                  })
                }
              >
                <SelectTrigger
                  className={
                    fieldErrors.businessUnit ? "border-destructive" : ""
                  }
                >
                  <SelectValue placeholder="Select business unit" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.businessUnit && (
                <p className="text-sm text-destructive">
                  {fieldErrors.businessUnit}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Submit Incident
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
