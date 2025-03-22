
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import AgreementCard from '@/components/AgreementCard';
import { Shield, Users, FileText, Activity, Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/toast';
import { getAccessLogs, clearAccessLogs, AccessLogEntry, clearAllAgreements } from '@/utils/agreementUtils';

const AdminDashboard = () => {
  const { allAgreements, loading, adminDeleteAgreement } = useAgreements();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // If not admin, redirect to regular dashboard
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);
  
  // Load access logs
  useEffect(() => {
    setAccessLogs(getAccessLogs());
    
    // Load users list
    const storedUsers = localStorage.getItem('pact_pal_users');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        // Remove passwords before setting state
        const sanitizedUsers = users.map((user: any) => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        setUsersList(sanitizedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    }
  }, []);
  
  const handleDeleteAgreement = async (id: string) => {
    if (!isAdmin) return;
    
    try {
      await adminDeleteAgreement(id);
    } catch (error) {
      console.error('Error deleting agreement:', error);
      toast.error('Failed to delete agreement');
    }
  };
  
  const handleClearAllAgreements = () => {
    if (window.confirm('Are you sure you want to delete ALL agreements? This action cannot be undone.')) {
      clearAllAgreements();
      toast.success('All agreements have been deleted');
    }
  };
  
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all access logs?')) {
      clearAccessLogs();
      setAccessLogs([]);
      toast.success('Access logs cleared');
    }
  };
  
  const handleRefreshData = () => {
    setAccessLogs(getAccessLogs());
    toast.success('Data refreshed');
  };
  
  if (!isAdmin) {
    return <div>Redirecting to dashboard...</div>;
  }
  
  return (
    <Layout>
      <div className="min-h-[80vh] animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{usersList.length}</p>
              <p className="text-sm text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Agreements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{allAgreements.length}</p>
              <p className="text-sm text-muted-foreground">Total agreements</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{accessLogs.length}</p>
              <p className="text-sm text-muted-foreground">Recorded actions</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="agreements">
          <TabsList className="mb-6">
            <TabsTrigger value="agreements">All Agreements</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agreements">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">All Agreements in System</h2>
              
              <Button variant="destructive" size="sm" onClick={handleClearAllAgreements}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Agreements
              </Button>
            </div>
            
            {allAgreements.length > 0 ? (
              <div className="space-y-4">
                {allAgreements.map((agreement) => (
                  <AgreementCard
                    key={agreement.id}
                    agreement={agreement}
                    onRequestDelete={() => handleDeleteAgreement(agreement.id)}
                    truncate={false}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No agreements in the system</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="users">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Registered Users</h2>
            </div>
            
            {usersList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 border-b">ID</th>
                      <th className="text-left p-3 border-b">Name</th>
                      <th className="text-left p-3 border-b">Email</th>
                      <th className="text-left p-3 border-b">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="p-3 border-b">{user.id.slice(0, 8)}...</td>
                        <td className="p-3 border-b">{user.name}</td>
                        <td className="p-3 border-b">{user.email}</td>
                        <td className="p-3 border-b">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No users found</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Access Logs</h2>
              
              <Button variant="outline" size="sm" onClick={handleClearLogs}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Logs
              </Button>
            </div>
            
            {accessLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 border-b">Timestamp</th>
                      <th className="text-left p-3 border-b">User</th>
                      <th className="text-left p-3 border-b">Action</th>
                      <th className="text-left p-3 border-b">Agreement ID</th>
                      <th className="text-left p-3 border-b">Status</th>
                      <th className="text-left p-3 border-b">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLogs.slice().reverse().map((log, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="p-3 border-b whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 border-b">{log.userName}</td>
                        <td className="p-3 border-b">{log.action}</td>
                        <td className="p-3 border-b">
                          {log.agreementId ? (
                            <a 
                              href={`/agreements/${log.agreementId}`}
                              className="text-primary hover:underline"
                            >
                              {log.agreementId.slice(0, 8)}...
                            </a>
                          ) : '-'}
                        </td>
                        <td className="p-3 border-b">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="p-3 border-b">
                          {log.details || log.error || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No access logs found</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
