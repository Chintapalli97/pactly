
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAgreements } from '@/context/AgreementContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import AgreementCard from '@/components/AgreementCard';
import Layout from '@/components/Layout';
import { PlusCircle, Inbox, Send } from 'lucide-react';

const Dashboard = () => {
  const { sentAgreements, receivedAgreements, requestDeleteAgreement, loading } = useAgreements();
  const { user } = useAuth();
  
  const recentSent = sentAgreements.slice(0, 3);
  const recentReceived = receivedAgreements.slice(0, 3);
  const pendingCount = receivedAgreements.filter(a => a.status === 'pending').length;
  
  const handleRequestDelete = (id: string) => {
    requestDeleteAgreement(id);
  };

  useEffect(() => {
    document.title = 'Dashboard | PactPal';
  }, []);

  return (
    <Layout>
      <div className="min-h-[80vh] animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 animate-slide-down">
          Welcome, {user?.name}!
        </h1>
        <p className="text-muted-foreground mb-8 animate-slide-down delay-100">
          Manage your agreements or create a new one.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-10 animate-scale-in delay-200">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Create New Agreement
            </h2>
            <p className="text-muted-foreground mb-6">
              Start a new agreement and share it with a friend. Keep track of your casual promises.
            </p>
            <Link to="/create">
              <Button className="w-full md:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Agreement
              </Button>
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg p-6 border border-secondary/20">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Inbox className="h-5 w-5 mr-2" />
              Pending Responses
            </h2>
            <p className="text-muted-foreground mb-6">
              You have {pendingCount} agreement{pendingCount !== 1 ? 's' : ''} waiting for your response.
            </p>
            <Link to="/my-agreements">
              <Button variant="outline" className="w-full md:w-auto">
                View All Agreements
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 animate-scale-in delay-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Agreements You Sent</h2>
              {sentAgreements.length > 3 && (
                <Link to="/my-agreements?tab=sent" className="text-sm text-primary hover:underline">
                  View all ({sentAgreements.length})
                </Link>
              )}
            </div>
            
            {recentSent.length > 0 ? (
              <div className="space-y-4">
                {recentSent.map((agreement) => (
                  <AgreementCard
                    key={agreement.id}
                    agreement={agreement}
                    onRequestDelete={() => handleRequestDelete(agreement.id)}
                    isPreview
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  You haven't sent any agreements yet.
                </p>
                <Link to="/create" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Agreement
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Agreements You Received</h2>
              {receivedAgreements.length > 3 && (
                <Link to="/my-agreements?tab=received" className="text-sm text-primary hover:underline">
                  View all ({receivedAgreements.length})
                </Link>
              )}
            </div>
            
            {recentReceived.length > 0 ? (
              <div className="space-y-4">
                {recentReceived.map((agreement) => (
                  <AgreementCard
                    key={agreement.id}
                    agreement={agreement}
                    onRequestDelete={() => handleRequestDelete(agreement.id)}
                    isPreview
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  You haven't received any agreements yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
