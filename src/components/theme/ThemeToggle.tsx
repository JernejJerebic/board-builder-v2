import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Notification from "@/components/Notification";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check if dark mode is already set
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    setShowNotification(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="ml-auto"
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
      {showNotification && (
        <Notification
          message={`Dark mode ${isDark ? 'enabled' : 'disabled'}`}
          type="info"
          duration={3000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};
