
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAgreements } from '@/hooks/useAgreementsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgreementCard from '@/components/AgreementCard';
import Layout from '@/components/Layout';
import { Agreement } from '@/types/agreement';
import { Inbox, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MyAgreements = () => {
  const { sentAgreements, receivedAgreements, requestDeleteAgreement, loading } = useAgreements();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Get the active tab from URL or default to 'all'
  const activeTab = searchParams.get('tab') || 'all';
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };
  
  // Filter agreements based on search term and status
  const filterAgreements = (agreements: Agreement[]) => {
    return agreements.filter(agreement => {
      const matchesSearch = 
        agreement.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agreement.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agreement.recipientName && agreement.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };
  
  const filteredSent = filterAgreements(sentAgreements);
  const filteredReceived = filterAgreements(receivedAgreements);
  
  // Determine which agreements to show based on active tab
  const agreements = activeTab === 'sent' 
    ? filteredSent 
    : activeTab === 'received'
    ? filteredReceived
    : [...filteredSent, ...filteredReceived];
  
  const handleRequestDelete = (id: string) => {
    requestDeleteAgreement(id);
  };

  useEffect(() => {
    document.title = 'My Agreements | PactPal';
  }, []);
  
  return (
    <Layout>
      <div className="min-h-[80vh] animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 animate-slide-down">
          My Agreements
        </h1>
        <p className="text-muted-foreground mb-8 animate-slide-down delay-100">
          Manage all of your sent and received agreements
        </p>
        
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-in delay-200">
          <div className="md:col-span-2">
            <Input
              placeholder="Search agreements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={handleTabChange}
          className="animate-scale-in delay-300"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center">
              <Send className="h-4 w-4 mr-1" />
              Sent ({sentAgreements.length})
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center">
              <Inbox className="h-4 w-4 mr-1" />
              Received ({receivedAgreements.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : agreements.length > 0 ? (
              agreements.map((agreement) => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onRequestDelete={() => handleRequestDelete(agreement.id)}
                  truncate={false}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No agreements found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : filteredSent.length > 0 ? (
              filteredSent.map((agreement) => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onRequestDelete={() => handleRequestDelete(agreement.id)}
                  truncate={false}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No sent agreements found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : filteredReceived.length > 0 ? (
              filteredReceived.map((agreement) => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  onRequestDelete={() => handleRequestDelete(agreement.id)}
                  truncate={false}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No received agreements found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyAgreements;
