
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, User } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <Layout>
      <div className="min-h-[80vh] animate-fade-in max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <Card className="glass-card animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">{user?.name}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p>{user?.email}</p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
