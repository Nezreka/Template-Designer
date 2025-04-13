import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import TemplateEditModal from './template-edit-modal';

type Template = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    sections: number;
  };
};

type TemplateListModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function TemplateListModal({ open, onClose }: TemplateListModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch templates when the modal opens
  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  // Fetch templates from the API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/templates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
      // Remove the template from the list
      setTemplates(templates.filter(template => template.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Manage Templates
          </DialogTitle>
          <DialogDescription>
            View, edit, or delete your templates
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2 bg-gray-700" />
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 mx-auto text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-400">Loading templates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-400">{error}</p>
              <Button 
                onClick={fetchTemplates}
                className="mt-4 bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
              >
                Retry
              </Button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              {searchTerm ? (
                <p>No templates found matching "{searchTerm}"</p>
              ) : (
                <p>No templates found. Create a new template to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id}
                  className="p-4 rounded-md bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium mb-1">{template.name}</h3>
                      <div className="text-xs text-gray-400">
                        <span>Created: {formatDate(template.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span>Sections: {template._count.sections}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md text-sm py-1 h-8"
                        onClick={() => {
                          setEditTemplateId(template.id);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-red-400 font-medium shadow-md text-sm py-1 h-8"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
          >
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Template edit modal */}
      <TemplateEditModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditTemplateId(null);
          // Refresh the templates list
          fetchTemplates();
        }}
        templateId={editTemplateId}
      />
    </Dialog>
  );
}