
import React from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

const LoadingState: React.FC = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    </Layout>
  );
};

export default LoadingState;
