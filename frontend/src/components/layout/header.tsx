import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ERP Incident Triage</span>
        </Link>
        <nav>
          <Button asChild>
            <Link to="/incidents/new">New Incident</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
