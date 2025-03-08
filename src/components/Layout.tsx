
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Oblikovalec desk', path: '/' },
    { name: 'Stranke', path: '/customers' },
    { name: 'Naročila', path: '/orders' },
    { name: 'Barve', path: '/colors' },
    { name: 'Dnevniki', path: '/logs' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/">
                <h1 className="text-2xl font-bold text-primary">WoodBoard</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "font-medium transition-colors hover:text-primary",
                    location.pathname === item.path ? "text-primary" : "text-gray-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow bg-muted">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} WoodBoard - Aplikacija za rezanje po meri
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
