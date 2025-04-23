
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { BasketProvider } from "./context/BasketContext";
import { useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";

const queryClient = new QueryClient();

const App = () => {
  // Set global font size
  useEffect(() => {
    // Set base font size to 18px
    document.documentElement.style.fontSize = "18px";
    
    // You could also add a CSS class to the body for more styling control
    document.body.classList.add("text-lg");
    
    return () => {
      // Cleanup in case component unmounts
      document.body.classList.remove("text-lg");
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BasketProvider>
            <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark transition-colors">
              <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
              </div>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </div>
          </BasketProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
