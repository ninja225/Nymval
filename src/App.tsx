
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProfileMenu } from "./components/ProfileMenu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between">
                <a href="/">
                  <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Logo" className="h-16 w-16" />
                  </div>
                </a>
                <div className="flex-1 flex justify-center">
                  <a
                    href="/"
                    className="font-bold text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
                  >
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-1.5 py-0.5 rounded">
                      Nymval
                    </span>
                    <span className="ml-2">AI</span>
                  </a>
                </div>
                
                <div className="flex items-center gap-4">
                  <ProfileMenu />
                </div>
              </div>
            </header>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
