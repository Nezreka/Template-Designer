import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SectionOrder } from './types';
import { useBuilder } from './context';
import { getTemplateSection } from './template-data';
// Import the new database API
import { fetchTemplateSection } from '../../lib/template-api';

type DroppableAreaProps = {
  children: React.ReactNode;
};

export function DroppableArea({ children }: DroppableAreaProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: 'builder-drop-area',
  });

  return (
    <div
      ref={setNodeRef}
      suppressHydrationWarning
      className={`
        bg-gray-800/50 border ${isOver ? 'border-indigo-400 border-2' : 'border-gray-700'} 
        rounded-lg p-8 min-h-[80vh] backdrop-blur-sm shadow-xl transition-colors duration-300 
        ${isOver ? 'bg-gray-700/50' : ''}
        ${active ? 'ring-2 ring-indigo-300 ring-opacity-50' : ''}
      `}
    >
      {children}
    </div>
  );
}

export function SectionItem({ section }: { section: SectionOrder }) {
  const { removeSection, moveSection, getTemplateName } = useBuilder();
  const sectionType = section.sectionTypeId;
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | null>(null);
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch section content when the section or active tab changes
  useEffect(() => {
    if (!section.templateId) return;
    
    const loadSectionContent = async () => {
      // First check if this is a built-in template
      if (['classic', 'modern', 'luxury'].includes(section.templateId)) {
        // Use the mock data for built-in templates
        const mockContent = getTemplateSection(section.templateId, section.sectionTypeId);
        setSectionContent(mockContent);
        return;
      }
      
      // Otherwise, fetch from the database
      setLoading(true);
      try {
        const dbContent = await fetchTemplateSection(section.templateId, section.sectionTypeId);
        if (dbContent) {
          setSectionContent(dbContent);
        } else {
          console.error('No section content found for', section.sectionTypeId);
        }
      } catch (error) {
        console.error('Error fetching section content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Load content when active tab is set or section changes
    if (activeTab || !sectionContent) {
      loadSectionContent();
    }
  }, [section.templateId, section.sectionTypeId, activeTab]);
  
  // Derive name from section type ID
  const getSectionName = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div 
      className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-4 mb-4 shadow-md transition-all duration-300"
      suppressHydrationWarning
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="font-medium text-lg">{getSectionName(sectionType)} Section</h4>
          {section.templateId && (
            <p className="text-xs text-indigo-300 mt-1">
              From <span className="font-medium">{getTemplateName(section.templateId)}</span>
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-300 hover:text-white" 
            title="Move Up"
            onClick={() => moveSection(section.id, 'up')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-300 hover:text-white" 
            title="Move Down"
            onClick={() => moveSection(section.id, 'down')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-700 text-red-400/70 hover:text-red-400 transition-colors" 
            title="Remove"
            onClick={() => removeSection(section.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Code viewer tabs */}
      <div className="mt-3 border-t border-gray-700 pt-3">
        <div className="flex gap-2 mb-3">
          <button 
            className={`text-xs py-1 px-2 rounded transition-colors ${
              activeTab === 'html' 
                ? 'bg-indigo-600 text-white font-medium' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab(activeTab === 'html' ? null : 'html')}
          >
            View HTML
          </button>
          <button 
            className={`text-xs py-1 px-2 rounded transition-colors ${
              activeTab === 'css' 
                ? 'bg-indigo-600 text-white font-medium' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab(activeTab === 'css' ? null : 'css')}
          >
            View CSS
          </button>
          <button 
            className={`text-xs py-1 px-2 rounded transition-colors ${
              activeTab === 'js' 
                ? 'bg-indigo-600 text-white font-medium' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab(activeTab === 'js' ? null : 'js')}
          >
            View JS
          </button>
        </div>
        
        {/* Code preview */}
        {activeTab && (
          <div className="mt-2 bg-gray-950 p-3 rounded-md border border-gray-800 max-h-[200px] overflow-auto font-mono text-xs">
            {loading ? (
              <div className="text-center py-4 text-gray-400">
                <p>Loading content...</p>
              </div>
            ) : sectionContent ? (
              <pre className="text-gray-200">
                {activeTab === 'html' && sectionContent.html}
                {activeTab === 'css' && sectionContent.css}
                {activeTab === 'js' && sectionContent.js}
              </pre>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <p>No content available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
