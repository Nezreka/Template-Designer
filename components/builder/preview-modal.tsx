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
  
  // State for section content and template globals
  const [sectionsContent, setSectionsContent] = useState<{[key: string]: any}>({});
  const [globalCss, setGlobalCss] = useState<string>('');
  const [globalJs, setGlobalJs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Load content for all sections and global CSS/JS when modal opens
  useEffect(() => {
    if (!open) return;
    
    const loadAllSections = async () => {
      setLoading(true);
      const newContent: {[key: string]: any} = {};
      const templateGlobalCss: string[] = [];
      const templateGlobalJs: string[] = [];
      
      // First, get all unique template IDs used in the composition
      const templateIds = builderSections
        .filter(section => section.templateId && !['classic', 'modern', 'luxury'].includes(section.templateId))
        .map(section => section.templateId!)
        .filter((id, index, array) => array.indexOf(id) === index); // Remove duplicates
      
      // Fetch global CSS and JS for all templates concurrently
      await Promise.all(templateIds.map(async (templateId) => {
        try {
          const response = await fetch(`/api/templates/${templateId}`);
          if (!response.ok) return;
          
          const templateData = await response.json();
          
          // Add global CSS and JS with template name comments
          if (templateData.globalCss) {
            templateGlobalCss.push(`/* Global CSS from template: ${templateData.name} */\n${templateData.globalCss}`);
          }
          
          if (templateData.globalJs) {
            templateGlobalJs.push(`/* Global JS from template: ${templateData.name} */\n${templateData.globalJs}`);
          }
        } catch (error) {
          console.error(`Error fetching globals for template ${templateId}:`, error);
        }
      }));
      
      // Now load individual section content
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
            
            // No global CSS/JS for mock templates, or we could add later if needed
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
      
      // Update state with section content and global CSS/JS
      setSectionsContent(newContent);
      setGlobalCss(templateGlobalCss.join('\n\n'));
      setGlobalJs(templateGlobalJs.join('\n\n'));
      setLoading(false);
    };
    
    loadAllSections();
  }, [open, builderSections]);
  
  // Get content for a specific section
  const getSectionContent = (section: SectionOrder) => {
    return sectionsContent[section.id] || null;
  };
  
  // Combine all section styles with global CSS
  const combinedStyles = `
/* Global CSS */
${globalCss}

/* Section styles */
${builderSections
  .map(section => getSectionContent(section)?.css)
  .filter(Boolean)
  .join('\n')}
`;
  
  // Combine all section scripts with global JS
  const combinedScripts = `
// Global JavaScript
${globalJs}

// Section JavaScript
${builderSections
  .map(section => getSectionContent(section)?.js)
  .filter(Boolean)
  .join('\n')}
`;

  // Generate complete HTML for the iframe preview
  const getPreviewHtml = () => {
    // Generate section HTML with template containers
    const sectionsHtml = builderSections.map((section) => {
      const content = getSectionContent(section);
      const templateName = getTemplateName(section.templateId || '');
      
      // Create camelCase ID from template name
      const templateIdCamelCase = templateName
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word, index) => {
          const lowerWord = word.toLowerCase();
          return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join('');
      
      if (!content) {
        return `
        <div class="preview-section">
          <div id="${templateIdCamelCase}">
            <div class="flex items-center justify-center">
              <p class="text-gray-500">Content not available for this section</p>
            </div>
          </div>
        </div>`;
      }
      
      return `
      <div class="preview-section">
        <div id="${templateIdCamelCase}">
          ${content.html}
        </div>
      </div>`;
    }).join('\n');
    
    // Complete HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    /* Import Google Fonts */
    @import url("https://fonts.googleapis.com/css2?family=Playfair+Display&family=Raleway:wght@300;400;600&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Jost:ital,wght@0,100..900;1,100..900&family=Manrope:wght@200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");
    
    /* Base styles for preview interface */
    body {
      margin: 0;
      padding: 0;
    }
    
    /* Template styles */
    ${combinedStyles}
  </style>
</head>
<body>
  <main id="cherieYoung" class="" style="opacity: 1;">
    ${sectionsHtml}
  </main>
  
  <script>
    ${combinedScripts}
  </script>
</body>
</html>`;
  };

  // Get viewport width based on selected mode
  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '800px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Template Preview
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Preview your template with all selected sections.</span>
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-2 rounded ${viewportMode === 'mobile' 
                  ? 'bg-indigo-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-indigo-300'}`}
                title="Mobile view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-2 rounded ${viewportMode === 'tablet' 
                  ? 'bg-indigo-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-indigo-300'}`}
                title="Tablet view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-2 rounded ${viewportMode === 'desktop' 
                  ? 'bg-indigo-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-indigo-300'}`}
                title="Desktop view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border border-gray-700 rounded-md mt-2 mb-2 bg-white text-black" style={{ maxHeight: "calc(95vh - 120px)", height: "calc(95vh - 120px)" }}>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : builderSections.length > 0 ? (
            <div className="w-full h-full flex justify-center" style={{ 
              backgroundColor: viewportMode !== 'desktop' ? '#f5f5f5' : 'transparent',
              paddingTop: viewportMode !== 'desktop' ? '20px' : '0'
            }}>
              {/* Use iframe to isolate CSS and JS */}
              <div style={{ 
                width: getViewportWidth(),
                height: '100%',
                transition: 'width 0.3s ease',
                boxShadow: viewportMode !== 'desktop' ? '0 0 10px rgba(0, 0, 0, 0.1)' : 'none'
              }}>
                <iframe 
                  srcDoc={getPreviewHtml()}
                  className="w-full h-full border-0"
                  style={{ minHeight: '800px', height: '100%' }}
                  title="Template Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
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