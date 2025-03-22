
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { Button } from './ui/button';
import { Bell, LogOut, UserCircle, PlusCircle, Home, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { hasNewNotifications, clearNotifications } = useAgreements();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is authenticated before allowing access to protected routes
  useEffect(() => {
    const publicRoutes = ['/', '/login', '/signup'];
    const isAgreementRoute = location.pathname.startsWith('/agreements/');
    
    if (!isAuthenticated && !publicRoutes.includes(location.pathname) && !isAgreementRoute) {
      navigate('/login');
    }
    
    // Redirect to admin dashboard if trying to access regular dashboard as admin
    if (isAdmin && location.pathname === '/dashboard') {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate]);

  // Navigation items
  const navItems = [
    { label: 'Home', icon: Home, path: isAdmin ? '/admin' : '/dashboard', requiresAuth: true },
    { label: 'My Agreements', icon: FileText, path: '/my-agreements', requiresAuth: true },
    { label: 'New Agreement', icon: PlusCircle, path: '/create', requiresAuth: true },
  ];
  
  // Admin-only items
  const adminItems = [
    { label: 'Admin Panel', icon: Shield, path: '/admin', requiresAuth: true, adminOnly: true },
  ];
  
  // Combined items
  const allNavItems = isAdmin 
    ? [...navItems, ...adminItems]
    : navItems;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b py-4 px-6 bg-white backdrop-blur-sm sticky top-0 z-10 bg-opacity-80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PactPal
            </span>
            {isAdmin && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {allNavItems.map((item) => (
              (!item.requiresAuth || isAuthenticated) && 
              (!item.adminOnly || isAdmin) && (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-1 text-sm font-medium transition-colors",
                    location.pathname === item.path 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  onClick={() => {
                    clearNotifications();
                    navigate('/notifications');
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {hasNewNotifications && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
                  )}
                </Button>
                
                <div className="text-sm hidden md:block">
                  Hi, {user?.name}
                </div>
                
                <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                  <UserCircle className="h-5 w-5" />
                </Button>
                
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Mobile navigation */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t py-2 px-6 bg-opacity-90 backdrop-blur-sm">
          <div className="flex justify-around">
            {allNavItems.map((item) => (
              (!item.requiresAuth || isAuthenticated) && 
              (!item.adminOnly || isAdmin) && (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center space-y-1 text-xs font-medium transition-colors p-2",
                    location.pathname === item.path 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            ))}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex flex-col items-center space-y-1 text-xs font-medium p-2 relative"
              onClick={() => {
                clearNotifications();
                navigate('/notifications');
              }}
            >
              <Bell className="h-5 w-5" />
              <span>Alerts</span>
              {hasNewNotifications && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      <main className="flex-grow py-6 px-4 sm:px-6 pb-16 md:pb-6">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
