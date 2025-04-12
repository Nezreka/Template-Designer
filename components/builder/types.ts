// Define the section types for the template builder
export type SectionType = {
  id: string;
  name: string;
  available?: boolean; // Optional because it's computed at runtime
};

// Template type
export type Template = {
  id: string;
  name: string;
  sections: TemplateSection[];
};

// Template section
export type TemplateSection = {
  id: string;
  sectionType: string;
  html: string;
  css: string;
  js: string;
};

// Section order in the builder
export type SectionOrder = {
  id: string;
  sectionTypeId: string;
  templateId?: string; // Only has a value when a template has been selected
};