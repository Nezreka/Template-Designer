import React, { useState, useEffect } from 'react';
import { getTemplateSection } from './template-data';
import { fetchTemplateSection } from '../../lib/template-api';
import { SectionOrder } from './types';
import { useBuilder } from './context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';

type PreviewModalProps = {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
};

export function PreviewModal({ open, onClose, onExport }: PreviewModalProps) {
  const { builderSections, getTemplateName, generateExport } = useBuilder();
  
  // Format section type for display
  const formatSectionType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // State for section content
  const [sectionsContent, setSectionsContent] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  
  // Load content for all sections when modal opens
  useEffect(() => {
    if (!open) return;
    
    const loadAllSections = async () => {
      setLoading(true);
      const newContent: {[key: string]: any} = {};
      
      for (const section of builderSections) {
        if (!section.templateId) continue;
        
        try {
          // Check if it's a built-in template
          if (['classic', 'modern', 'luxury'].includes(section.templateId)) {
            // Use mock data
            const mockContent = getTemplateSection(section.templateId, section.sectionTypeId);
            if (mockContent) {
              newContent[section.id] = {
                html: mockContent.html,
                css: mockContent.css,
                js: mockContent.js
              };
            }
          } else {
            // Fetch from database
            const dbContent = await fetchTemplateSection(section.templateId, section.sectionTypeId);
            if (dbContent) {
              newContent[section.id] = {
                html: dbContent.html,
                css: dbContent.css,
                js: dbContent.js
              };
            }
          }
        } catch (error) {
          console.error(`Error loading section ${section.sectionTypeId}:`, error);
        }
      }
      
      setSectionsContent(newContent);
      setLoading(false);
    };
    
    loadAllSections();
  }, [open, builderSections]);
  
  // Get content for a specific section
  const getSectionContent = (section: SectionOrder) => {
    return sectionsContent[section.id] || null;
  };
  
  // Combine all section styles
  const combinedStyles = builderSections
    .map(section => getSectionContent(section)?.css)
    .filter(Boolean)
    .join('\n');
  
  // Combine all section scripts
  const combinedScripts = builderSections
    .map(section => getSectionContent(section)?.js)
    .filter(Boolean)
    .join('\n');

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Template Preview
          </DialogTitle>
          <DialogDescription>
            Preview your template with all selected sections.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border border-gray-700 rounded-md my-4 bg-white text-black">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : builderSections.length > 0 ? (
            <div>
              {/* Embed styles */}
              <style dangerouslySetInnerHTML={{ __html: combinedStyles }} />
              
              {/* Render sections */}
              {builderSections.map((section) => {
                const content = getSectionContent(section);
                if (!content) {
                  return (
                    <div key={section.id} className="preview-section relative">
                      {/* Section label */}
                      <div className="absolute top-0 left-0 bg-indigo-700 text-white px-2 py-1 text-xs">
                        {formatSectionType(section.sectionTypeId)} - {getTemplateName(section.templateId || '')}
                      </div>
                      
                      {/* Section content placeholder */}
                      <div className="min-h-[150px] border-b border-gray-200 py-8 flex items-center justify-center">
                        <p className="text-gray-500">Content not available for this section</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={section.id} className="preview-section relative">
                    {/* Section label */}
                    <div className="absolute top-0 left-0 bg-indigo-700 text-white px-2 py-1 text-xs">
                      {formatSectionType(section.sectionTypeId)} - {getTemplateName(section.templateId || '')}
                    </div>
                    
                    {/* Section content */}
                    <div 
                      dangerouslySetInnerHTML={{ __html: content.html }}
                      className="min-h-[150px] border-b border-gray-200 py-8"
                    />
                  </div>
                );
              })}
              
              {/* Embed scripts */}
              <script dangerouslySetInnerHTML={{ __html: combinedScripts }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No sections added to preview
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
          >
            Close
          </Button>
          <Button 
            className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
            onClick={() => {
              onClose();
              onExport();
            }}
          >
            Export Design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}