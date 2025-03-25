import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
interface LayoutProps {
  children: React.ReactNode;
}

// Admin credentials
const ADMIN_CREDENTIALS = [{
  email: "em.mont3@gmail.com",
  password: "12emir34"
}, {
  email: "jerebic.jernej@gmail.com",
  password: "12jernej34"
}];
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navItems = [{
    name: 'Naročilo razreza',
    path: '/',
    adminOnly: false
  }, {
    name: 'Stranke',
    path: '/customers',
    adminOnly: true
  }, {
    name: 'Naročila',
    path: '/orders',
    adminOnly: true
  }, {
    name: 'Barve',
    path: '/colors',
    adminOnly: true
  }, {
    name: 'Dnevniki',
    path: '/logs',
    adminOnly: true
  }];
  const handleLogin = () => {
    const isValidCredentials = ADMIN_CREDENTIALS.some(cred => cred.email === email && cred.password === password);
    if (isValidCredentials) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setLoginOpen(false);
      toast({
        title: "Prijava uspešna",
        description: "Prijavljeni ste kot administrator."
      });
    } else {
      toast({
        title: "Napaka pri prijavi",
        description: "Neveljavni podatki za prijavo.",
        variant: "destructive"
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
      description: "Uspešno ste se odjavili."
    });
  };
  return <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/">
                <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" className="h-12 md:h-16" />
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navItems.filter(item => !item.adminOnly || isAdmin).map(item => <Link key={item.path} to={item.path} className="mx-[17px] py-[7px]">
                    {item.name}
                  </Link>)}
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
          <div className="flex flex-col items-center">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} LCC Naročilo razreza - Aplikacija za rezanje po meri
            </p>
            <div className="mt-1">
              {isAdmin ? <button onClick={handleLogout} className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-50 px-[12px] py-[5px] rounded-full">Prijava</button> : <button onClick={() => setLoginOpen(true)} className="text-gray-400 text-xs hover:text-gray-600">
                  administrator
                </button>}
            </div>
          </div>
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
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Geslo</label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginOpen(false)}>Prekliči</Button>
            <Button onClick={handleLogin}>Prijava</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Layout;