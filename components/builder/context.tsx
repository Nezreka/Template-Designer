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
  ) => Promise<{ html: string, css?: string, js?: string }>;
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
  const generateExport = async (
    format: 'combined' | 'separate' = 'combined',
    options?: { 
      title?: string 
    }
  ): Promise<{ html: string, css?: string, js?: string }> => {
    if (builderSections.length === 0) {
      return { html: '' };
    }
    
    // Set a default title if not provided
    const title = options?.title || 'Generated Template';
    
    // Collect all HTML, CSS, and JS from selected sections
    const sectionsHtml: string[] = [];
    const sectionsCSS: string[] = [];
    const sectionsJS: string[] = [];
    const globalCSS: string[] = [];
    const globalJS: string[] = [];
    
    // Set to keep track of templates we've already processed for globals
    const processedTemplateIds = new Set<string>();
    
    // First, fetch all globals from all templates used in the composition
    // This ensures we have all the global CSS and JS before generating the HTML
    const templateIds = builderSections
      .filter(section => section.templateId && !['classic', 'modern', 'luxury'].includes(section.templateId))
      .map(section => section.templateId!)
      .filter((id, index, array) => array.indexOf(id) === index); // Remove duplicates
    
    // Maps to store unique global JS and CSS
    const globalJsMap = new Map<string, { content: string, size: number, source: string }>();
    const globalCssMap = new Map<string, { content: string, size: number, source: string }>();
    
    // Fetch global CSS and JS for all templates concurrently
    await Promise.all(templateIds.map(async (templateId) => {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) return;
        
        const templateData = await response.json();
        
        // Handle global CSS - check for duplicates
        if (templateData.globalCss) {
          const cssContent = templateData.globalCss.trim();
          const cssSize = cssContent.length;
          
          // Check if we already have identical CSS
          let isDuplicateCss = false;
          
          // Iterate through existing CSS to find duplicates
          for (const [key, value] of globalCssMap.entries()) {
            if (key === cssContent) {
              // Exact duplicate found, no need to add it again
              isDuplicateCss = true;
              break;
            }
          }
          
          if (!isDuplicateCss) {
            // Not a duplicate, add to our map
            globalCssMap.set(cssContent, { 
              content: cssContent, 
              size: cssSize,
              source: templateData.name
            });
          }
        }
        
        // Handle global JS - check for duplicates or similar scripts
        if (templateData.globalJs) {
          const jsContent = templateData.globalJs.trim();
          const scriptSize = jsContent.length;
          
          // Check if we already have identical scripts
          let isDuplicate = false;
          
          // Iterate through existing scripts to find duplicates
          for (const [key, value] of globalJsMap.entries()) {
            if (key === jsContent) {
              // Exact duplicate found, no need to add it again
              isDuplicate = true;
              break;
            }
          }
          
          if (!isDuplicate) {
            // Not a duplicate, add to our map
            globalJsMap.set(jsContent, { 
              content: jsContent, 
              size: scriptSize,
              source: templateData.name
            });
          }
        }
        
        // Also cache the template name
        dbTemplateNames[templateId] = templateData.name;
        
        // Mark this template as processed for globals
        processedTemplateIds.add(templateId);
      } catch (error) {
        console.error(`Error fetching globals for template ${templateId}:`, error);
      }
    }));
    
    // Process the globalCssMap and add to the globalCSS array
    // Sort larger CSS first in case they are supersets of smaller ones
    const sortedCss = Array.from(globalCssMap.values())
      .sort((a, b) => b.size - a.size);
    
    for (const css of sortedCss) {
      globalCSS.push(`/* Global CSS from template: ${css.source} */\n${css.content}`);
    }
    
    // Process the globalJsMap and add to the globalJS array
    // Sort larger scripts first in case they are supersets of smaller scripts
    const sortedScripts = Array.from(globalJsMap.values())
      .sort((a, b) => b.size - a.size);
    
    for (const script of sortedScripts) {
      globalJS.push(`/* Global JS from template: ${script.source} */\n${script.content}`);
    }
    
    // Handle section content loading
    // We need to load each section's content sequentially using await
    // to ensure it's properly loaded before generating HTML
    const loadSectionContent = async () => {
      for (const section of builderSections) {
        if (!section.templateId) continue;
        
        try {
          // For built-in templates, use the mock data
          if (['classic', 'modern', 'luxury'].includes(section.templateId)) {
            const templateSection = getTemplateSection(section.templateId, section.sectionTypeId);
            if (templateSection) {
              sectionsHtml.push(templateSection.html);
              sectionsCSS.push(templateSection.css);
              sectionsJS.push(templateSection.js);
            } else {
              // Placeholder for missing mock section
              sectionsHtml.push(`<section class="${section.sectionTypeId}">Mock section not found</section>`);
              sectionsCSS.push(`.${section.sectionTypeId} { padding: 20px; text-align: center; }`);
              sectionsJS.push('');
            }
          } else {
            // For database templates, fetch directly for exports
            let sectionContent = null;
            
            // Check cache first
            if (dbSectionsCache[section.templateId] && 
                dbSectionsCache[section.templateId][section.sectionTypeId]) {
              sectionContent = dbSectionsCache[section.templateId][section.sectionTypeId];
            } else {
              // Fetch from API if not in cache
              const response = await fetch(`/api/templates/${section.templateId}`);
              if (response.ok) {
                const template = await response.json();
                const dbSection = template.sections.find(s => s.sectionTypeId === section.sectionTypeId);
                
                if (dbSection) {
                  sectionContent = {
                    html: dbSection.html,
                    css: dbSection.css,
                    js: dbSection.js || ''
                  };
                  
                  // Cache for future use
                  if (!dbSectionsCache[section.templateId]) {
                    dbSectionsCache[section.templateId] = {};
                  }
                  
                  dbSectionsCache[section.templateId][section.sectionTypeId] = sectionContent;
                }
              }
            }
            
            // Add content to output arrays
            if (sectionContent) {
              sectionsHtml.push(sectionContent.html);
              sectionsCSS.push(sectionContent.css);
              sectionsJS.push(sectionContent.js);
            } else {
              // Fallback if we couldn't get the content
              sectionsHtml.push(`<section class="${section.sectionTypeId}">Content not available</section>`);
              sectionsCSS.push(`.${section.sectionTypeId} { padding: 20px; text-align: center; }`);
              sectionsJS.push('');
            }
          }
        } catch (error) {
          console.error(`Error loading section ${section.sectionTypeId}:`, error);
          // Fallback
          sectionsHtml.push(`<section class="${section.sectionTypeId}">Error loading content</section>`);
          sectionsCSS.push(`.${section.sectionTypeId} { padding: 20px; text-align: center; color: red; }`);
          sectionsJS.push('');
        }
      }
    };
    
    // Execute content loading before proceeding
    await loadSectionContent();
    
    // If combined format, return a single HTML file with embedded CSS and JS
    if (format === 'combined') {
      // Convert title to camelCase for use as template container ID
      const camelCaseTitle = title
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word, index) => {
          const lowerWord = word.toLowerCase();
          return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join('');

      // Wrap each section's HTML in its template container
      const wrappedSectionsHtml = builderSections.map((section, index) => {
        const templateName = getTemplateName(section.templateId || '');
        const templateIdCamelCase = templateName
          .replace(/\s+/g, ' ')
          .trim()
          .split(' ')
          .map((word, index) => {
            const lowerWord = word.toLowerCase();
            return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
          })
          .join('');

        return `<div id="${templateIdCamelCase}">
  ${sectionsHtml[index] || `<div class="${section.sectionTypeId}">Section content not available</div>`}
</div>`;
      });

      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Import Google Fonts */
    @import url("https://fonts.googleapis.com/css2?family=Playfair+Display&family=Raleway:wght@300;400;600&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Jost:ital,wght@0,100..900;1,100..900&family=Manrope:wght@200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");
    
    /* Global styles */
    ${globalCSS.join('\n\n')}

    /* Combined template styles */
    ${sectionsCSS.join('\n\n')}
  </style>
</head>
<body>
  <!-- Template sections wrapped in required containers -->
  <main id="cherieYoung" class="" style="opacity: 0;">
    ${wrappedSectionsHtml.join('\n\n')}
  </main>
  
  <!-- Combined template scripts -->
  <script>
    /* Global JavaScript */
    ${globalJS.join('\n\n')}

    /* Section JavaScript */
    ${sectionsJS.join('\n\n')}
  </script>
</body>
</html>`
      };
    }
    
    // If separate format, return HTML with links to CSS and JS files
    // Create wrapped sections with template IDs (same as combined format)
    const wrappedSectionsHtml = builderSections.map((section, index) => {
      const templateName = getTemplateName(section.templateId || '');
      const templateIdCamelCase = templateName
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word, index) => {
          const lowerWord = word.toLowerCase();
          return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join('');

      return `<div id="${templateIdCamelCase}">
  ${sectionsHtml[index] || `<div class="${section.sectionTypeId}">Section content not available</div>`}
</div>`;
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Template sections wrapped in required containers -->
  <main id="cherieYoung" class="" style="opacity: 0;">
    ${wrappedSectionsHtml.join('\n\n')}
  </main>
  
  <script src="scripts.js"></script>
</body>
</html>`;

    const css = `/* Import Google Fonts */
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display&family=Raleway:wght@300;400;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Jost:ital,wght@0,100..900;1,100..900&family=Manrope:wght@200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");

/* Global styles */
${globalCSS.join('\n\n')}

/* Combined template styles */
${sectionsCSS.join('\n\n')}`;

    const js = `// Global JavaScript
${globalJS.join('\n\n')}

// Combined template scripts
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