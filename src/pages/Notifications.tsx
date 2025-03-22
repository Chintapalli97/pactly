
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAgreements } from '@/hooks/useAgreementsContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const Notifications = () => {
  const { sentAgreements, receivedAgreements, clearNotifications } = useAgreements();
  const navigate = useNavigate();
  
  // Find agreements with status changes (responded to)
  const recentlyUpdated = sentAgreements.filter(
    a => a.status !== 'pending' && a.recipientId
  ).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);
  
  // Find agreements requiring action (pending responses)
  const pendingAction = receivedAgreements.filter(
    a => a.status === 'pending'
  ).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  useEffect(() => {
    document.title = 'Notifications | PactPal';
    clearNotifications();
  }, [clearNotifications]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="min-h-[80vh] animate-fade-in max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="flex items-center mb-6">
          <Bell className="h-5 w-5 mr-2" />
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
        
        <div className="space-y-8 animate-scale-in">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center">
                <Badge variant="outline" className="mr-2">
                  {pendingAction.length}
                </Badge>
                Agreements Requiring Action
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {pendingAction.length > 0 ? (
                <ul className="divide-y">
                  {pendingAction.map(agreement => (
                    <li key={agreement.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <Link to={`/agreements/${agreement.id}`} className="block">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">From {agreement.creatorName}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(agreement.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {agreement.message}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No agreements require your action at this time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center">
                <Badge variant="outline" className="mr-2">
                  {recentlyUpdated.length}
                </Badge>
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {recentlyUpdated.length > 0 ? (
                <ul className="divide-y">
                  {recentlyUpdated.map(agreement => (
                    <li key={agreement.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <Link to={`/agreements/${agreement.id}`} className="block">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">
                              {agreement.recipientName} has {agreement.status}
                            </span>
                            {getStatusIcon(agreement.status)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(agreement.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {agreement.message}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No recent updates to your agreements.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
