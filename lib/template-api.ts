import { Template as ApiTemplate, Section as ApiSection } from '@prisma/client';
import { Template, TemplateSection } from '../components/builder/types';

// Types to match the API responses
type TemplateWithSections = ApiTemplate & {
  sections: ApiSection[];
};

// Fetch all templates from the API
export async function fetchAllTemplates(): Promise<TemplateWithSections[]> {
  try {
    // First, get the list of templates
    const response = await fetch('/api/templates');
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    const templates = await response.json();
    
    // Then, for each template, fetch its sections
    const templatesWithSections = await Promise.all(
      templates.map(async (template: ApiTemplate) => {
        const sectionResponse = await fetch(`/api/templates/${template.id}`);
        if (!sectionResponse.ok) {
          throw new Error(`Failed to fetch sections for template ${template.id}`);
        }
        return sectionResponse.json();
      })
    );
    
    return templatesWithSections;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

// Fetch templates for a specific section type
export async function fetchTemplatesForSectionType(sectionTypeId: string): Promise<Template[]> {
  try {
    // Fetch all templates with their sections
    const templates = await fetchAllTemplates();
    
    // Filter templates that have the specified section type
    const filteredTemplates = templates.filter(template => 
      template.sections.some(section => section.sectionTypeId === sectionTypeId)
    );
    
    // Convert API template format to the format expected by the UI
    return filteredTemplates.map(apiTemplate => ({
      id: apiTemplate.id,
      name: apiTemplate.name,
      sections: apiTemplate.sections.map(apiSection => ({
        id: apiSection.id,
        sectionType: apiSection.sectionTypeId,
        html: apiSection.html,
        css: apiSection.css,
        js: apiSection.js || ''
      }))
    }));
  } catch (error) {
    console.error(`Error fetching templates for section type ${sectionTypeId}:`, error);
    return []; // Return empty array on error
  }
}

// Fetch a specific section from a template
export async function fetchTemplateSection(templateId: string, sectionTypeId: string): Promise<TemplateSection | null> {
  try {
    // Fetch the template with its sections
    const response = await fetch(`/api/templates/${templateId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template ${templateId}`);
    }
    
    const template: TemplateWithSections = await response.json();
    
    // Find the matching section
    const section = template.sections.find(s => s.sectionTypeId === sectionTypeId);
    
    if (!section) {
      return null;
    }
    
    // Convert to the format expected by the UI
    return {
      id: section.id,
      sectionType: section.sectionTypeId,
      html: section.html,
      css: section.css,
      js: section.js || ''
    };
  } catch (error) {
    console.error(`Error fetching section ${sectionTypeId} from template ${templateId}:`, error);
    return null;
  }
}

// Get template name by ID
export async function getTemplateName(templateId: string): Promise<string> {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template ${templateId}`);
    }
    
    const template: ApiTemplate = await response.json();
    return template.name;
  } catch (error) {
    console.error(`Error fetching template name for ${templateId}:`, error);
    return 'Unknown Template';
  }
}