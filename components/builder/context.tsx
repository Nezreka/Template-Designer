import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { SectionType, SectionOrder } from './types';
// Use the real API, but keep mock data as fallback
import { fetchTemplateSection } from '../../lib/template-api';
import { getTemplateSection } from './template-data';

type BuilderContextType = {
  // All section types
  sectionTypes: SectionType[];
  // Sections added to the builder area
  builderSections: SectionOrder[];
  // Pending section waiting for template selection
  pendingSection: SectionOrder | null;
  // Add a section to the builder
  addSection: (sectionTypeId: string) => void;
  // Remove a section from the builder
  removeSection: (sectionId: string) => void;
  // Move a section up or down in the builder
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  // Set the template for a pending section and add it to the builder
  setTemplateForSection: (templateId: string) => void;
  // Clear the pending section (cancel template selection)
  clearPendingSection: () => void;
  // Get template name for a section 
  getTemplateName: (templateId: string) => string;
  // Get available sections (derived from builder sections)
  getAvailableSections: () => SectionType[];
  // Generate HTML export
  generateExport: (
    format?: 'combined' | 'separate', 
    options?: { title?: string }
  ) => { html: string, css?: string, js?: string };
};

// All possible section types
const sectionTypes: SectionType[] = [
  { id: 'hero', name: 'Hero' },
  { id: 'welcome', name: 'Welcome' },
  { id: 'featured-areas', name: 'Featured Areas' },
  { id: 'featured-lifestyles', name: 'Featured Lifestyles' },
  { id: 'featured-listings', name: 'Featured Listings' },
  { id: 'sold-listings', name: 'Sold Listings' },
  { id: 'stats', name: 'Stats' },
  { id: 'homeworth', name: 'Homeworth' },
  { id: 'buyer-seller', name: 'Buyer / Seller' },
  { id: 'buyer', name: 'Buyer' },
  { id: 'seller', name: 'Seller' },
  { id: 'social', name: 'Social' },
  { id: 'contact', name: 'Contact' },
];

// Simple template name mapping for built-in templates
const templateNames: Record<string, string> = {
  'classic': 'Classic Template',
  'modern': 'Modern Template',
  'luxury': 'Luxury Template',
};

// Cache for database template names
const dbTemplateNames: Record<string, string> = {};

// Cache for database template sections
interface DbSectionCache {
  [templateId: string]: {
    [sectionTypeId: string]: {
      html: string;
      css: string;
      js: string;
    };
  };
}
const dbSectionsCache: DbSectionCache = {};

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [builderSections, setBuilderSections] = useState<SectionOrder[]>([]);
  const [pendingSection, setPendingSection] = useState<SectionOrder | null>(null);

  // Get available sections based on what's currently in the builder
  // This is a computed value rather than state
  const getAvailableSections = () => {
    // Get all section types that are already in the builder or pending
    const usedSectionTypeIds = new Set([
      ...builderSections.map(s => s.sectionTypeId),
      ...(pendingSection ? [pendingSection.sectionTypeId] : [])
    ]);
    
    // Return all section types with availability flag
    return sectionTypes.map(section => ({
      ...section,
      available: !usedSectionTypeIds.has(section.id)
    }));
  };

  // Add a section to the builder (creates pending section waiting for template selection)
  const addSection = (sectionTypeId: string) => {
    // Check if section is already in use
    const isAlreadyUsed = builderSections.some(s => s.sectionTypeId === sectionTypeId) || 
                         (pendingSection && pendingSection.sectionTypeId === sectionTypeId);
    
    if (isAlreadyUsed) {
      console.warn(`Section ${sectionTypeId} is already in use and cannot be added again.`);
      return;
    }

    // Create a pending section that waits for template selection
    const newSection: SectionOrder = {
      id: `${sectionTypeId}-${Math.random().toString(36).substr(2, 9)}`,
      sectionTypeId,
    };

    // Set the pending section which will trigger the template selection modal
    setPendingSection(newSection);
  };

  // Handle cancellation of template selection
  const clearPendingSection = () => {
    // Simply clear the pending section
    setPendingSection(null);
  };

  // Set template for the pending section and add it to the builder
  const setTemplateForSection = (templateId: string) => {
    if (!pendingSection) return;

    // Add section to builder with selected template
    const sectionWithTemplate = {
      ...pendingSection,
      templateId,
    };

    // Update builder sections to include the new section
    setBuilderSections(prev => [...prev, sectionWithTemplate]);
    
    // Clear the pending section
    setPendingSection(null);
    
    // Preload template data if it's not a built-in template
    if (!['classic', 'modern', 'luxury'].includes(templateId)) {
      // Preload template name and section content
      fetch(`/api/templates/${templateId}`)
        .then(response => response.json())
        .then(template => {
          // Cache template name
          dbTemplateNames[templateId] = template.name;
          
          // Find and cache the specific section
          const section = template.sections.find(
            s => s.sectionTypeId === pendingSection?.sectionTypeId
          );
          
          if (section) {
            // Initialize cache for this template if needed
            if (!dbSectionsCache[templateId]) {
              dbSectionsCache[templateId] = {};
            }
            
            // Cache the section data
            dbSectionsCache[templateId][pendingSection.sectionTypeId] = {
              html: section.html,
              css: section.css,
              js: section.js || ''
            };
            
            console.log(`Preloaded section ${pendingSection.sectionTypeId} from ${template.name}`);
          }
        })
        .catch(error => {
          console.error('Error preloading template data:', error);
        });
    }
  };

  // Remove a section from the builder
  const removeSection = (sectionId: string) => {
    // Remove from builder sections
    setBuilderSections(builderSections.filter(s => s.id !== sectionId));
  };

  // Move a section up or down in the builder
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = builderSections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    // Can't move up if already at the top
    if (direction === 'up' && index === 0) return;
    // Can't move down if already at the bottom
    if (direction === 'down' && index === builderSections.length - 1) return;

    const newBuilderSections = [...builderSections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const sectionToMove = newBuilderSections[index];
    
    // Remove from current position
    newBuilderSections.splice(index, 1);
    // Insert at new position
    newBuilderSections.splice(newIndex, 0, sectionToMove);

    setBuilderSections(newBuilderSections);
  };

  // Get template name for display
  const getTemplateName = (templateId: string): string => {
    // Check built-in templates first
    if (templateNames[templateId]) {
      return templateNames[templateId];
    }
    
    // Check if we've cached this database template name
    if (dbTemplateNames[templateId]) {
      return dbTemplateNames[templateId];
    }
    
    // If it's not a built-in or cached template, it's likely from the database
    // Let's fetch it asynchronously and cache it for next time
    fetch(`/api/templates/${templateId}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.name) {
          // Update the cache for next time
          dbTemplateNames[templateId] = data.name;
        }
      })
      .catch(error => {
        console.error('Error fetching template name:', error);
      });
    
    // Return a temporary value while we fetch the real name
    return 'Loading Template...';
  };

  // Generate HTML export for the entire template
  const generateExport = (
    format: 'combined' | 'separate' = 'combined',
    options?: { 
      title?: string 
    }
  ): { html: string, css?: string, js?: string } => {
    if (builderSections.length === 0) {
      return { html: '' };
    }
    
    // Set a default title if not provided
    const title = options?.title || 'Generated Template';
    
    // Collect all HTML, CSS, and JS from selected sections
    const sectionsHtml: string[] = [];
    const sectionsCSS: string[] = [];
    const sectionsJS: string[] = [];
    
    // Handle both database and mock templates
    builderSections.forEach(section => {
      if (section.templateId) {
        // For built-in templates, use the mock data
        if (['classic', 'modern', 'luxury'].includes(section.templateId)) {
          const templateSection = getTemplateSection(section.templateId, section.sectionTypeId);
          if (templateSection) {
            sectionsHtml.push(templateSection.html);
            sectionsCSS.push(templateSection.css);
            sectionsJS.push(templateSection.js);
          }
        } else {
          // For database templates, check the cache first
          if (dbSectionsCache[section.templateId] && 
              dbSectionsCache[section.templateId][section.sectionTypeId]) {
            
            const cachedSection = dbSectionsCache[section.templateId][section.sectionTypeId];
            sectionsHtml.push(cachedSection.html);
            sectionsCSS.push(cachedSection.css);
            sectionsJS.push(cachedSection.js);
            
          } else {
            // No cached data, include a placeholder
            sectionsHtml.push(`<section class="${section.sectionTypeId}"><p>Loading section from database...</p></section>`);
            sectionsCSS.push(`.${section.sectionTypeId} { padding: 20px; text-align: center; }`);
            sectionsJS.push('');
            
            // Kick off the async fetch for next time
            fetch(`/api/templates/${section.templateId}`)
              .then(response => response.json())
              .then(template => {
                const dbSection = template.sections.find(s => s.sectionTypeId === section.sectionTypeId);
                if (dbSection) {
                  // Cache the section data for future use
                  if (!dbSectionsCache[section.templateId]) {
                    dbSectionsCache[section.templateId] = {};
                  }
                  
                  dbSectionsCache[section.templateId][section.sectionTypeId] = {
                    html: dbSection.html,
                    css: dbSection.css,
                    js: dbSection.js || ''
                  };
                  
                  console.log(`Cached section ${section.sectionTypeId} from template ${template.name}`);
                  
                  // Also cache the template name while we're at it
                  dbTemplateNames[section.templateId] = template.name;
                }
              })
              .catch(error => {
                console.error('Error fetching template section:', error);
              });
          }
        }
      }
    });
    
    // If combined format, return a single HTML file with embedded CSS and JS
    if (format === 'combined') {
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Combined template styles */
    ${sectionsCSS.join('\n\n')}
  </style>
</head>
<body>
  <!-- Template sections -->
  ${sectionsHtml.join('\n\n')}
  
  <!-- Combined template scripts -->
  <script>
    ${sectionsJS.join('\n\n')}
  </script>
</body>
</html>`
      };
    }
    
    // If separate format, return HTML with links to CSS and JS files
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Template sections -->
  ${sectionsHtml.join('\n\n')}
  
  <script src="scripts.js"></script>
</body>
</html>`;

    const css = `/* Combined template styles */
${sectionsCSS.join('\n\n')}`;

    const js = `// Combined template scripts
${sectionsJS.join('\n\n')}`;

    return { html, css, js };
  };

  return (
    <BuilderContext.Provider
      value={{
        sectionTypes,
        builderSections,
        pendingSection,
        addSection,
        removeSection,
        moveSection,
        setTemplateForSection,
        clearPendingSection,
        getTemplateName,
        getAvailableSections,
        generateExport,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}