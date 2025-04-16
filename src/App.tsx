
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { BasketProvider } from "./context/BasketContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useEffect } from "react";

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
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </BasketProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
