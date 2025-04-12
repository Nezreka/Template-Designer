import React from 'react';
import { useBuilder } from '../builder/context';
import { DraggableSection } from '../builder/draggable-section';

export function Sidebar() {
  const { getAvailableSections } = useBuilder();
  
  // Get sections with availability info
  const sections = getAvailableSections();
  
  // Count available sections
  const availableCount = sections.filter(section => section.available).length;
  const totalCount = sections.length;

  return (
    <aside className="w-full md:w-[250px] lg:w-[300px] h-full bg-gray-900/90 backdrop-blur-lg border-r border-gray-700 p-4 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Section Types</h2>
          <p className="text-sm text-gray-300 mb-2">Drag sections to the builder area</p>
          <div className="text-xs text-gray-400">
            <span className="font-medium text-indigo-300">{availableCount}</span> of <span>{totalCount}</span> sections available
          </div>
        </div>
        
        <div className="my-4 h-[1px] bg-gray-700" />
        
        <div className="space-y-2">
          {/* Render all sections, ensuring only available ones can be dragged */}
          {sections.map((section) => (
            <DraggableSection
              key={section.id}
              id={section.id}
              name={section.name}
              available={section.available ?? true}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}