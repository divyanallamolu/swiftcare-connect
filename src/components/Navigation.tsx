import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ambulance, Building2, LayoutDashboard, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, signOut } = useAuth();

  // Don't show navigation on auth page
  if (location.pathname === '/auth') return null;

  const navLinks = [
    { href: '/', label: 'Emergency', icon: Ambulance, roles: ['patient', 'hospital'] },
    { href: '/hospitals', label: 'Hospitals', icon: Building2, roles: ['patient', 'hospital'] },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['hospital'] },
  ].filter(link => !role || link.roles.includes(role));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Ambulance className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">
            HealthQueue
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant={location.pathname === link.href ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  location.pathname === link.href && "bg-accent text-accent-foreground"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          
          {user && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {role === 'hospital' ? 'Hospital' : 'Patient'}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background p-4 space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant={location.pathname === link.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  location.pathname === link.href && "bg-accent text-accent-foreground"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          
          {user && (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-destructive"
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          )}
        </nav>
      )}
    </header>
  );
}
