
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { BasketProvider } from "./context/BasketContext";
import { useEffect } from "react";

// Create a new query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

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
      <TooltipProvider>
        <BasketProvider>
          <Toaster />
          <Sonner position="top-right" expand={true} closeButton richColors />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </BasketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
