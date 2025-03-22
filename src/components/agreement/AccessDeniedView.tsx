
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, Shield } from 'lucide-react';

const AccessDeniedView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] max-w-2xl mx-auto animate-fade-in">
      <Card className="glass-card animate-scale-in">
        <CardHeader className="border-b bg-destructive/10">
          <div className="flex items-center gap-2 text-destructive">
            <Shield className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>
              <p className="mt-2">You don't have permission to view this agreement.</p>
              <p className="mt-1">
                This agreement may be private and limited to only the parties involved.
              </p>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <p>To view this agreement, you need to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be the creator of the agreement</li>
              <li>Be the designated recipient of the agreement</li>
              <li>Have admin privileges on the system</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              If you believe you should have access to this agreement, please contact the administrator or the person who shared this link with you.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <button 
            className="text-primary hover:underline text-sm"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
          <button 
            className="text-primary hover:underline text-sm"
            onClick={() => navigate('/my-agreements')}
          >
            My Agreements
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccessDeniedView;
