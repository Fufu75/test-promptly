import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { Head } from "@/components/Head";
import Auth from "./pages/Auth";
import SiteCreator from "./pages/SiteCreator";
import SitePreview from "./pages/SitePreview";
import CreatorLanding from "./pages/CreatorLanding";
import ProjectsDashboard from "./pages/ProjectsDashboard";
import NotFound from "./pages/NotFound";
import Navbar from "@/components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Head />
            <Routes>
              {/* Auth plateforme - sans navbar */}
              <Route path="/auth" element={<Auth />} />

              {/* Toutes les autres routes - avec navbar */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <div className="pt-24">
                      <Routes>
                        <Route path="/" element={<CreatorLanding />} />
                        <Route path="/dashboard" element={<ProjectsDashboard />} />
                        <Route path="/creator" element={<SiteCreator />} />
                        <Route path="/preview" element={<SitePreview />} />
                        <Route path="/preview/*" element={<SitePreview />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
