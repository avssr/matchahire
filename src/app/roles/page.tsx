'use client';

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { RoleCard } from '@/components/roles/RoleCard';
import { RoleModal } from '@/components/roles/RoleModal';
import { Button } from '@/components/client/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

interface Role {
  id: string;
  title: string;
  description: string;
  location: string;
  level: string;
  tags: string[];
  requirements: string[];
  responsibilities: string[];
  company_id: string;
  company_name: string;
  conversation_mode: 'structured' | 'conversational';
  expected_response_length: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'apply'>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*');

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setRoles([]);
        return;
      }

      // Fetch company names
      const companyIds = rolesData.map(role => role.company_id);
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);

      if (companiesError) throw companiesError;

      // Map company names to roles
      const rolesWithCompanies = rolesData.map(role => ({
        ...role,
        company_name: companiesData?.find(company => company.id === role.company_id)?.name || 'Unknown Company',
        conversation_mode: role.conversation_mode as 'structured' | 'conversational',
        requirements: role.requirements || [],
        responsibilities: role.responsibilities || []
      }));

      setRoles(rolesWithCompanies);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load roles. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChat = (role: Role) => {
    setSelectedRole(role);
    setActiveTab('chat');
  };

  const handleApply = (role: Role) => {
    setSelectedRole(role);
    setActiveTab('apply');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchRoles}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Open Roles</h1>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="Search roles, companies, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      {filteredRoles.length === 0 ? (
        <div className="text-center text-slate-600">
          {searchQuery ? 'No roles match your search.' : 'No open roles at the moment.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <RoleCard 
              key={role.id} 
              role={{
                id: role.id,
                title: role.title,
                location: role.location || 'Remote',
                level: role.level,
                tags: role.tags,
                company_name: role.company_name,
                conversation_mode: role.conversation_mode,
                expected_response_length: role.expected_response_length
              }}
              onClick={() => {
                setSelectedRole(role);
                setActiveTab('details');
              }}
              onChat={() => handleChat(role)}
              onApply={() => handleApply(role)}
            />
          ))}
        </div>
      )}

      {selectedRole && (
        <RoleModal
          role={selectedRole}
          isOpen={!!selectedRole}
          onClose={() => setSelectedRole(null)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
} 