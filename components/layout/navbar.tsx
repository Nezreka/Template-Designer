import React from 'react';
import { Button } from '../ui/button';

export function Navbar() {
  return (
    <header className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">Template Builder</h1>
        </div>
        
        <div className="relative group">
          <Button className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md">
            Manage Templates
          </Button>
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800/90 backdrop-blur-lg border border-gray-700 hidden group-hover:block transition-all duration-300">
            <a href="#" className="block px-4 py-2 text-sm text-gray-100 hover:bg-gray-700">Add New Template</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-100 hover:bg-gray-700">Edit Template</a>
          </div>
        </div>
      </div>
    </header>
  );
}