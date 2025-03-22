
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, FileText, Share } from 'lucide-react';
import Layout from '@/components/Layout';

const Welcome = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in">
        <div className="max-w-3xl">
          <div className="mb-6 inline-block">
            <span className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PactPal
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 animate-slide-down delay-100">
            Keep your promises, make it fun
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 animate-slide-down delay-200">
            Create fun, informal agreements between friends. Track who owes who a coffee, who's on dish duty next, or who promised to plan the next night out. Simple. Playful. Accountable.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-down delay-300">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
                
                <Link to="/create">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Create New Agreement
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-24 mb-12 grid md:grid-cols-3 gap-12 text-left max-w-5xl animate-scale-in">
          <div className="flex flex-col items-center md:items-start">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Agreements</h3>
            <p className="text-muted-foreground text-center md:text-left">
              Create quick, casual agreements with friends. No legal jargon, just plain language.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <Share className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-muted-foreground text-center md:text-left">
              Share agreements with a simple link. No account needed to view, just to respond.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Status</h3>
            <p className="text-muted-foreground text-center md:text-left">
              See who accepted and who declined. Get notified when agreements change status.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Welcome;
