import React, { useState } from 'react';
import { Button } from '../ui/button';
import TemplateCreateModal from '../templates/template-create-modal';
import TemplateListModal from '../templates/template-list-modal';

export function Navbar() {
  const [showTemplateCreateModal, setShowTemplateCreateModal] = useState(false);
  const [showTemplateListModal, setShowTemplateListModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleAddNewTemplate = () => {
    setIsDropdownOpen(false);
    setShowTemplateCreateModal(true);
  };

  const handleEditTemplate = () => {
    setIsDropdownOpen(false);
    setShowTemplateListModal(true);
  };

  return (
    <header className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">Template Builder</h1>
        </div>
        
        <div className="relative">
          <Button 
            className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Manage Templates
          </Button>
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800/90 backdrop-blur-lg border border-gray-700 transition-all duration-300"
            >
              <button 
                onClick={handleAddNewTemplate} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
              >
                Add New Template
              </button>
              <button 
                onClick={handleEditTemplate} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-700"
              >
                Edit Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Template creation modal */}
      <TemplateCreateModal 
        open={showTemplateCreateModal} 
        onClose={() => setShowTemplateCreateModal(false)} 
      />

      {/* Template list modal for editing */}
      <TemplateListModal 
        open={showTemplateListModal} 
        onClose={() => setShowTemplateListModal(false)} 
      />
    </header>
  );
}