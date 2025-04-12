import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  useSensor, 
  useSensors, 
  PointerSensor,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';
import { useBuilder } from './context';
import { CSS } from '@dnd-kit/utilities';

type DndProviderProps = {
  children: React.ReactNode;
};

export function DragDropProvider({ children }: DndProviderProps) {
  const { addSection, getAvailableSections } = useBuilder();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  // Configure sensors for drag detection with better support
  const sensors = useSensors(
    // Mouse is the primary sensor
    useSensor(MouseSensor, {
      // Lower activation distance for quicker response
      activationConstraint: {
        distance: 3, 
      },
    }),
    // Touch for mobile devices
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    // Pointer as fallback for older browsers
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, 
      },
    })
  );

  // Handle drag start event to set the active drag item
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    // If dropped on the droppable area and the section is still available
    if (over && over.id === 'builder-drop-area') {
      // Get the section ID from the draggable item
      const sectionTypeId = String(active.id);
      
      // Find the section in available sections
      const availableSections = getAvailableSections();
      const sectionToAdd = availableSections.find(s => s.id === sectionTypeId);
      
      // Only add if the section exists and is available
      if (sectionToAdd && sectionToAdd.available) {
        // Add the section to the builder
        addSection(sectionTypeId);
      }
    }
    
    // Reset the active drag item
    setActiveDragId(null);
  };

  // Find the active section for overlay
  const sections = getAvailableSections();
  const activeSection = sections.find(section => section.id === activeDragId);

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      {/* DragOverlay renders a clone of the dragged item that moves freely */}
      <DragOverlay dropAnimation={{
        duration: 300,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Bounce effect
      }}>
        {activeDragId && activeSection && (
          <div 
            className="p-3 rounded-md bg-indigo-700/90 border border-indigo-500 shadow-lg backdrop-blur-sm"
            style={{ 
              width: 'auto', 
              minWidth: '220px',
              transform: 'scale(1.05)',
              cursor: 'grabbing'
            }}
          >
            <div className="font-medium text-white">{activeSection.name}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}