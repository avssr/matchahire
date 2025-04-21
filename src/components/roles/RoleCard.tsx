'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface RoleCardProps {
  role: {
    id: string;
    title: string;
    location: string;
    department: string;
    company_name: string;
    traits: string[];
  };
  onClick: () => void;
}

export function RoleCard({ role, onClick }: RoleCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {role.title}
            </h3>
            <p className="text-slate-600 mt-1">{role.company_name}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
            {role.department}
          </span>
        </div>
        
        <div className="flex items-center text-slate-600 mb-4">
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {role.location}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {role.traits.map((trait, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-sm"
            >
              {trait}
            </span>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
} 