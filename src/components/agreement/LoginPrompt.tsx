
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LoginPrompt: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-md p-4 text-center">
      <p className="mb-2">You need to log in or sign up to respond to this agreement.</p>
      <div className="flex justify-center gap-2 mt-4">
        <Button onClick={() => navigate('/login')}>Log In</Button>
        <Button variant="outline" onClick={() => navigate('/signup')}>Sign Up</Button>
      </div>
    </div>
  );
};

export default LoginPrompt;
