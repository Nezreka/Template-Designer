import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SectionOrder } from './types';
import { useBuilder } from './context';

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
  
  // Derive name from section type ID
  const getSectionName = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div 
      className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-4 mb-4 shadow-md"
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
            className="p-1 rounded hover:bg-gray-700 transition-colors" 
            title="Move Up"
            onClick={() => moveSection(section.id, 'up')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-700 transition-colors" 
            title="Move Down"
            onClick={() => moveSection(section.id, 'down')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-700 hover:text-red-400 transition-colors" 
            title="Remove"
            onClick={() => removeSection(section.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-3 border-t border-gray-700 pt-3 flex gap-2">
        <button className="text-xs bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded transition-colors">View HTML</button>
        <button className="text-xs bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded transition-colors">View CSS</button>
        <button className="text-xs bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded transition-colors">View JS</button>
      </div>
    </div>
  );
}
