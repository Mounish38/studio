"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';

interface HeaderProps {
  onOpenCreateTaskDialog: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateTaskDialog }) => {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">TaskMaster</h1>
        <Button onClick={onOpenCreateTaskDialog} variant="default">
          <PlusSquare className="mr-2 h-5 w-5" />
          New Task
        </Button>
      </div>
    </header>
  );
};
