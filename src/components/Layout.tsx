
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './theme/ThemeToggle';

// Add the ThemeToggle to the header section
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="border-b">
        <div className="container mx-auto flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">LCC Naročila</Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Check if we're not on the admin routes */}
            {!location.pathname.includes('/admin') && (
              <Link 
                to="/admin/orders" 
                className="ml-4 inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto my-8">
        {children}
      </main>
      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LCC d.o.o. Vse pravice pridržane.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
