import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import TemplateSectionBuilder from './template-section-builder';
import TemplateCodeEditor from './template-code-editor';

type TemplateCreateModalProps = {
  open: boolean;
  onClose: () => void;
};

// This will track the steps in the template creation process
type Step = 'sections' | 'content' | 'review';

export default function TemplateCreateModal({ open, onClose }: TemplateCreateModalProps) {
  const [step, setStep] = useState<Step>('sections');
  const [templateName, setTemplateName] = useState('');
  const [globalCss, setGlobalCss] = useState('');
  const [globalJs, setGlobalJs] = useState('');
  
  // Array of selected section types for this template
  const [selectedSections, setSelectedSections] = useState<{
    id: string;
    sectionTypeId: string;
    html: string;
    css: string;
    js: string;
    order: number;
  }[]>([]);

  // Track the currently editing section
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Handle closing with reset
  const handleClose = () => {
    onClose();
    // Reset the form state on close
    setStep('sections');
    setTemplateName('');
    setGlobalCss('');
    setGlobalJs('');
    setSelectedSections([]);
    setCurrentSectionIndex(0);
  };

  // Handle section selection
  const handleSectionSelect = (sectionTypeId: string) => {
    // Check if the section is already selected
    if (selectedSections.some(s => s.sectionTypeId === sectionTypeId)) {
      return;
    }

    // Add the section to the selected list
    setSelectedSections([
      ...selectedSections,
      {
        id: `new-${Date.now()}`,
        sectionTypeId,
        html: '',
        css: '',
        js: '',
        order: selectedSections.length
      }
    ]);
  };

  // Handle section removal
  const handleSectionRemove = (index: number) => {
    const newSections = [...selectedSections];
    newSections.splice(index, 1);
    
    // Reorder the remaining sections
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));
    
    setSelectedSections(reorderedSections);
    
    // If we're removing the current section, adjust the current index
    if (currentSectionIndex >= index && currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };
  
  // Handle section reordering
  const handleSectionMove = (index: number, direction: 'up' | 'down') => {
    // Can't move up if already at the top
    if (direction === 'up' && index === 0) return;
    // Can't move down if already at the bottom
    if (direction === 'down' && index === selectedSections.length - 1) return;
    
    const newSections = [...selectedSections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the sections
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    // Update the order property for each section
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));
    
    setSelectedSections(reorderedSections);
    
    // Also update currentSectionIndex if we're in the code editing step
    if (step === 'content') {
      if (currentSectionIndex === index) {
        setCurrentSectionIndex(newIndex);
      } else if (currentSectionIndex === newIndex) {
        setCurrentSectionIndex(index);
      }
    }
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
        alert('Please add at least one section to the template');
        return;
      }

      // Prepare the data for submission
      const templateData = {
        name: templateName,
        globalCss,
        globalJs,
        sections: selectedSections.map(({ id, ...section }) => section)
      };

      // Send the data to the API
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : (errorData.error || 'Failed to create template');
        throw new Error(errorMessage);
      }

      // Close the modal on success
      alert('Template created successfully!');
      handleClose();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 'sections':
        return (
          <TemplateSectionBuilder
            selectedSections={selectedSections}
            onSectionSelect={handleSectionSelect}
            onSectionRemove={handleSectionRemove}
            onSectionMove={handleSectionMove}
            onNext={() => setStep('content')}
            templateName={templateName}
            onTemplateNameChange={setTemplateName}
          />
        );
      case 'content':
        return (
          <TemplateCodeEditor
            sections={selectedSections}
            currentSectionIndex={currentSectionIndex}
            onSectionIndexChange={setCurrentSectionIndex}
            onSectionUpdate={handleSectionUpdate}
            globalCss={globalCss}
            globalJs={globalJs}
            onGlobalCssChange={setGlobalCss}
            onGlobalJsChange={setGlobalJs}
            onBack={() => setStep('sections')}
            onNext={() => setStep('review')}
          />
        );
      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Template Summary</h3>
              <p className="text-sm text-gray-400">Review your template before creating it</p>
              
              <div className="mt-4 p-4 bg-gray-800/50 rounded-md border border-gray-700">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300">Template Name</h4>
                  <p className="text-lg">{templateName}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300">Sections ({selectedSections.length})</h4>
                  <ul className="mt-2 space-y-1">
                    {selectedSections.map((section, index) => (
                      <li key={section.id} className="text-sm text-gray-400">
                        {index + 1}. {section.sectionTypeId}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Global Assets</h4>
                  <div className="mt-2 text-sm text-gray-400">
                    <p>CSS: {globalCss ? `${globalCss.length} characters` : 'None'}</p>
                    <p>JavaScript: {globalJs ? `${globalJs.length} characters` : 'None'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
                onClick={() => setStep('content')}
              >
                Back to Editor
              </Button>
              <Button
                className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
                onClick={handleSubmit}
              >
                Create Template
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {step === 'sections' && 'Add New Template - Select Sections'}
            {step === 'content' && 'Add New Template - Edit Content'}
            {step === 'review' && 'Add New Template - Review'}
          </DialogTitle>
          <DialogDescription>
            {step === 'sections' && 'Select the sections you want to include in your template'}
            {step === 'content' && 'Edit the HTML, CSS, and JS for each section'}
            {step === 'review' && 'Review your template before creating it'}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2 bg-gray-700" />
        
        <div className="flex-1 overflow-auto min-h-[500px]">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}