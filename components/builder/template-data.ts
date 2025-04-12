import { Template } from './types';

// Mock template data for testing
export const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic Template',
    sections: [
      {
        id: 'classic-hero',
        sectionType: 'hero',
        html: '<div class="hero">Classic Hero Section</div>',
        css: '.hero { /* Classic hero styles */ }',
        js: '// Classic hero JS'
      },
      {
        id: 'classic-welcome',
        sectionType: 'welcome',
        html: '<div class="welcome">Classic Welcome Section</div>',
        css: '.welcome { /* Classic welcome styles */ }',
        js: '// Classic welcome JS'
      },
      {
        id: 'classic-featured-areas',
        sectionType: 'featured-areas',
        html: '<div class="featured-areas">Classic Featured Areas Section</div>',
        css: '.featured-areas { /* Classic featured areas styles */ }',
        js: '// Classic featured areas JS'
      },
      {
        id: 'classic-stats',
        sectionType: 'stats',
        html: '<div class="stats">Classic Stats Section</div>',
        css: '.stats { /* Classic stats styles */ }',
        js: '// Classic stats JS'
      }
    ]
  },
  {
    id: 'modern',
    name: 'Modern Template',
    sections: [
      {
        id: 'modern-hero',
        sectionType: 'hero',
        html: '<div class="hero">Modern Hero Section</div>',
        css: '.hero { /* Modern hero styles */ }',
        js: '// Modern hero JS'
      },
      {
        id: 'modern-welcome',
        sectionType: 'welcome',
        html: '<div class="welcome">Modern Welcome Section</div>',
        css: '.welcome { /* Modern welcome styles */ }',
        js: '// Modern welcome JS'
      },
      {
        id: 'modern-featured-areas',
        sectionType: 'featured-areas',
        html: '<div class="featured-areas">Modern Featured Areas Section</div>',
        css: '.featured-areas { /* Modern featured areas styles */ }',
        js: '// Modern featured areas JS'
      },
      {
        id: 'modern-featured-lifestyles',
        sectionType: 'featured-lifestyles',
        html: '<div class="featured-lifestyles">Modern Featured Lifestyles Section</div>',
        css: '.featured-lifestyles { /* Modern featured lifestyles styles */ }',
        js: '// Modern featured lifestyles JS'
      },
      {
        id: 'modern-contact',
        sectionType: 'contact',
        html: '<div class="contact">Modern Contact Section</div>',
        css: '.contact { /* Modern contact styles */ }',
        js: '// Modern contact JS'
      }
    ]
  },
  {
    id: 'luxury',
    name: 'Luxury Template',
    sections: [
      {
        id: 'luxury-hero',
        sectionType: 'hero',
        html: '<div class="hero">Luxury Hero Section</div>',
        css: '.hero { /* Luxury hero styles */ }',
        js: '// Luxury hero JS'
      },
      {
        id: 'luxury-welcome',
        sectionType: 'welcome',
        html: '<div class="welcome">Luxury Welcome Section</div>',
        css: '.welcome { /* Luxury welcome styles */ }',
        js: '// Luxury welcome JS'
      },
      {
        id: 'luxury-featured-listings',
        sectionType: 'featured-listings',
        html: '<div class="featured-listings">Luxury Featured Listings Section</div>',
        css: '.featured-listings { /* Luxury featured listings styles */ }',
        js: '// Luxury featured listings JS'
      },
      {
        id: 'luxury-buyer-seller',
        sectionType: 'buyer-seller',
        html: '<div class="buyer-seller">Luxury Buyer/Seller Section</div>',
        css: '.buyer-seller { /* Luxury buyer/seller styles */ }',
        js: '// Luxury buyer/seller JS'
      },
      {
        id: 'luxury-homeworth',
        sectionType: 'homeworth',
        html: '<div class="homeworth">Luxury Homeworth Section</div>',
        css: '.homeworth { /* Luxury homeworth styles */ }',
        js: '// Luxury homeworth JS'
      }
    ]
  }
];

// Function to get available templates for a specific section type
export function getTemplatesForSectionType(sectionType: string): Template[] {
  return templates.filter(template => 
    template.sections.some(section => section.sectionType === sectionType)
  );
}

// Function to get a specific section from a template
export function getTemplateSection(templateId: string, sectionType: string) {
  const template = templates.find(t => t.id === templateId);
  if (!template) return null;
  
  return template.sections.find(s => s.sectionType === sectionType) || null;
}
