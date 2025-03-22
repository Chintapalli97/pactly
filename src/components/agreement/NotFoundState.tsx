
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCcw, Search, Home, ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/toast';
import { getStoredAgreements } from '@/utils/agreementUtils';

const NotFoundState: React.FC = () => {
  const navigate = useNavigate();
  
  const handleRefresh = () => {
    toast.info("Refreshing page...");
    window.location.reload();
  };
  
  const handleCheckStorage = () => {
    const agreements = getStoredAgreements();
    const count = agreements.length;
    toast.info(`Found ${count} agreements in storage`);
    
    if (count === 0) {
      toast.error("No agreements found in storage. Try creating a new one.");
    } else {
      toast.success("You have existing agreements. Check 'My Agreements'.");
    }
  };
  
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Agreement Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The agreement you're looking for doesn't exist or has been deleted.
        </p>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Possible reasons:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc text-left pl-5 mt-2">
              <li>The link might be incorrect or expired</li>
              <li>The agreement has been deleted by the creator or recipient</li>
              <li>The agreement may not have been saved properly</li>
              <li>You might need to log in to view this agreement</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button onClick={() => navigate('/dashboard')} className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/my-agreements')} className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            My Agreements
          </Button>
          <Button variant="ghost" onClick={handleRefresh} className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="w-full">
          <Button 
            variant="secondary" 
            className="w-full mb-4" 
            onClick={handleCheckStorage}
          >
            Check Local Storage
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/create')}
          >
            Create New Agreement
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundState;
