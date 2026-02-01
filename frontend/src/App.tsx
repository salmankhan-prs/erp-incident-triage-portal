import { Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/header";
import { HomePage } from "./pages/home-page";
import { IncidentPage } from "./pages/incident-page";
import { NewIncidentPage } from "./pages/new-incident-page";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/incidents/new" element={<NewIncidentPage />} />
          <Route path="/incidents/:id" element={<IncidentPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
