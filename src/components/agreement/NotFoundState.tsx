
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const NotFoundState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="text-3xl font-bold mb-4">Agreement Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The agreement you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </Layout>
  );
};

export default NotFoundState;
