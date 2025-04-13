import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import TemplateCodeEditor from './template-code-editor';

type Section = {
  id: string;
  sectionTypeId: string;
  html: string;
  css: string;
  js: string;
  order: number;
  templateId?: string;
};

type Template = {
  id: string;
  name: string;
  globalCss: string | null;
  globalJs: string | null;
  sections: Section[];
};

type TemplateEditModalProps = {
  open: boolean;
  onClose: () => void;
  templateId: string | null;
};

export default function TemplateEditModal({ open, onClose, templateId }: TemplateEditModalProps) {
  // Template state
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [globalCss, setGlobalCss] = useState('');
  const [globalJs, setGlobalJs] = useState('');
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch template data when modal opens and templateId changes
  useEffect(() => {
    if (open && templateId) {
      fetchTemplate(templateId);
    }
  }, [open, templateId]);

  // Fetch template from the API
  const fetchTemplate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/templates/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      
      const data = await response.json();
      setTemplate(data);
      
      // Update form state
      setTemplateName(data.name);
      setGlobalCss(data.globalCss || '');
      setGlobalJs(data.globalJs || '');
      
      // Sort sections by order
      const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
      setSelectedSections(sortedSections);
      
    } catch (error) {
      console.error('Error fetching template:', error);
      setError('Failed to load template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle closing with reset
  const handleClose = () => {
    onClose();
    // Reset the form state on close
    setTemplate(null);
    setTemplateName('');
    setGlobalCss('');
    setGlobalJs('');
    setSelectedSections([]);
    setCurrentSectionIndex(0);
    setSaveSuccess(false);
  };

  // Handle section code updates
  const handleSectionUpdate = (index: number, field: 'html' | 'css' | 'js', value: string) => {
    // Handle Global Assets section (-1 index)
    if (index === -1) {
      // For global assets, we don't update sections array
      return;
    }
    
    const newSections = [...selectedSections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };
    setSelectedSections(newSections);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (!templateName.trim()) {
        alert('Please enter a template name');
        return;
      }

      if (selectedSections.length === 0) {
        alert('Template must have at least one section');
        return;
      }

      if (!template || !template.id) {
        setError('Template data is missing or invalid');
        return;
      }

      setIsSaving(true);
      setSaveSuccess(false);
      
      // Prepare the data for submission
      const templateData = {
        name: templateName,
        globalCss,
        globalJs,
        // Include all sections in the update
        sections: selectedSections.map(section => ({
          id: section.id,
          sectionTypeId: section.sectionTypeId,
          html: section.html,
          css: section.css,
          js: section.js,
          order: section.order
        }))
      };

      // Update the template
      const templateResponse = await fetch(`/api/templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!templateResponse.ok) {
        const errorData = await templateResponse.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      // Set success state
      setSaveSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating template:', error);
      setError(`Failed to update template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Template
          </DialogTitle>
          <DialogDescription>
            Edit the template name, sections, and content
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2 bg-gray-700" />
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 mx-auto text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-400">Loading template...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-400">{error}</p>
            <Button 
              onClick={() => templateId && fetchTemplate(templateId)}
              className="mt-4 bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
            >
              Retry
            </Button>
          </div>
        ) : saveSuccess ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="mt-4 text-lg font-medium text-green-400">Template updated successfully!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto min-h-[500px] flex flex-col">
            {/* Template name input */}
            <div className="mb-6">
              <label htmlFor="template-name" className="block text-sm font-medium mb-2">
                Template Name
              </label>
              <input
                id="template-name"
                type="text"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter a name for your template"
              />
            </div>

            {/* Code editor */}
            {selectedSections.length > 0 && (
              <div className="flex-1">
                <TemplateCodeEditor
                  sections={selectedSections}
                  currentSectionIndex={currentSectionIndex}
                  onSectionIndexChange={setCurrentSectionIndex}
                  onSectionUpdate={handleSectionUpdate}
                  globalCss={globalCss}
                  globalJs={globalJs}
                  onGlobalCssChange={setGlobalCss}
                  onGlobalJsChange={setGlobalJs}
                  onBack={() => {}}
                  onNext={() => {}}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleClose}
                className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-gray-300 font-medium shadow-md mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-indigo-700 text-indigo-300 font-medium shadow-md"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}