
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, UserRoundCog } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

// Admin credentials
const ADMIN_CREDENTIALS = [
  { email: "em.mont3@gmail.com", password: "12emir34" },
  { email: "jerebic.jernej@gmail.com", password: "12jernej34" }
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navItems = [
    { name: 'Naročilo razreza', path: '/', adminOnly: false },
    { name: 'Stranke', path: '/customers', adminOnly: true },
    { name: 'Naročila', path: '/orders', adminOnly: true },
    { name: 'Barve', path: '/colors', adminOnly: true },
    { name: 'Dnevniki', path: '/logs', adminOnly: true },
  ];

  const handleLogin = () => {
    const isValidCredentials = ADMIN_CREDENTIALS.some(
      (cred) => cred.email === email && cred.password === password
    );

    if (isValidCredentials) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setLoginOpen(false);
      toast({
        title: "Prijava uspešna",
        description: "Prijavljeni ste kot administrator.",
      });
    } else {
      toast({
        title: "Napaka pri prijavi",
        description: "Neveljavni podatki za prijavo.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    if (location.pathname !== '/') {
      navigate('/');
    }
    toast({
      title: "Odjava uspešna",
      description: "Uspešno ste se odjavili.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/">
                <h1 className="text-2xl font-bold text-primary">LCC Naročilo razreza</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
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
              
              {isAdmin ? (
                <Button variant="ghost" onClick={handleLogout} className="flex items-center">
                  <UserRoundCog className="mr-2 h-4 w-4" />
                  Odjava
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setLoginOpen(true)} className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              )}
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
            © {new Date().getFullYear()} LCC Naročilo razreza - Aplikacija za rezanje po meri
          </p>
        </div>
      </footer>

      {/* Admin Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Administratorska prijava</DialogTitle>
            <DialogDescription>
              Vnesite podatke za dostop do administratorskega področja.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Geslo</label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginOpen(false)}>Prekliči</Button>
            <Button onClick={handleLogin}>Prijava</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
