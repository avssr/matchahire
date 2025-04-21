'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { RoleCard } from '@/components/roles/RoleCard';
import { RoleModal } from '@/components/roles/RoleModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Role {
  id: string;
  title: string;
  location: string;
  level: string;
  tags: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
  company_id: string;
  company_name?: string;
  conversation_mode: 'structured' | 'conversational';
  expected_response_length: string;
}

interface Company {
  id: string;
  name: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      console.log('Fetching roles...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*');

      if (rolesError) {
        console.error('Supabase roles error:', rolesError);
        throw rolesError;
      }

      console.log('Fetched roles:', rolesData);

      if (!rolesData || rolesData.length === 0) {
        console.log('No roles found');
        setRoles([]);
        return;
      }

      // Fetch company names
      const companyIds = rolesData.map((role: Role) => role.company_id);
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);

      if (companiesError) {
        console.error('Supabase companies error:', companiesError);
        throw companiesError;
      }

      const companyMap = new Map((companiesData as Company[] || []).map(company => [company.id, company.name]));

      const formattedRoles = rolesData.map((role: Role) => ({
        id: role.id,
        title: role.title,
        location: role.location,
        level: role.level,
        tags: role.tags || [],
        description: role.description || '',
        requirements: role.requirements || [],
        responsibilities: role.responsibilities || [],
        company_id: role.company_id,
        company_name: companyMap.get(role.company_id) || 'Unknown Company',
        conversation_mode: role.conversation_mode || 'structured',
        expected_response_length: role.expected_response_length || '1-2 paragraphs'
      }));

      console.log('Formatted roles:', formattedRoles);
      setRoles(formattedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
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
                location: role.location,
                department: role.level,
                company_name: role.company_name || 'Unknown Company',
                traits: role.tags
              }}
              onClick={() => setSelectedRole(role)}
            />
          ))}
        </div>
      )}

      {selectedRole && (
        <RoleModal
          role={{
            id: selectedRole.id,
            title: selectedRole.title,
            description: selectedRole.description,
            expectations: selectedRole.requirements,
            work_culture: selectedRole.responsibilities.join('\n'),
            persona: {
              name: 'Maya',
              mode: selectedRole.conversation_mode,
              tone: 'professional'
            }
          }}
          isOpen={!!selectedRole}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
} 