import React, { useState, useEffect } from 'react';
import { fetchTemplatesForSectionType } from '../../lib/template-api';
import { Template } from './types';
// Keep the mock data as a fallback
import { getTemplatesForSectionType } from './template-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

type TemplateSelectionModalProps = {
  sectionType: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
  open: boolean;
};

export function TemplateSelectionModal({
  sectionType,
  onSelect,
  onClose,
  open,
}: TemplateSelectionModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load available templates for this section type
  useEffect(() => {
    if (open && sectionType) {
      const loadTemplates = async () => {
        try {
          // First try to fetch from API
          const dbTemplates = await fetchTemplatesForSectionType(sectionType);
          
          if (dbTemplates.length > 0) {
            setTemplates(dbTemplates);
          } else {
            // Fall back to mock data if no templates in DB
            console.log('No templates found in database, using mock data');
            const mockTemplates = getTemplatesForSectionType(sectionType);
            setTemplates(mockTemplates);
          }
        } catch (error) {
          console.error('Error loading templates:', error);
          // Fall back to mock data on error
          const mockTemplates = getTemplatesForSectionType(sectionType);
          setTemplates(mockTemplates);
        }
      };
      
      loadTemplates();
      
      // Reset selection when modal opens
      setSelectedTemplate(null);
      setSearchTerm('');
    }
  }, [open, sectionType]);

  // Format section type for display
  const formatSectionType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle template selection
  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Select Template for {formatSectionType(sectionType)} Section
          </DialogTitle>
          <DialogDescription>
            Choose a template to pull the {formatSectionType(sectionType)} section from.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Template list */}
        <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-md cursor-pointer transition-colors duration-200 ${selectedTemplate === template.id
                  ? 'bg-indigo-800/30 border-indigo-500'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <h3 className="font-medium text-lg">{template.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Contains {template.sections.length} sections including {formatSectionType(sectionType)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No templates found with a {formatSectionType(sectionType)} section.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            className={`backdrop-blur-md border font-medium shadow-md ${
              selectedTemplate 
                ? 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-indigo-300' 
                : 'bg-gray-900/50 border-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!selectedTemplate}
          >
            Select Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
