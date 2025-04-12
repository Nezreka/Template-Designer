import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type DraggableSectionProps = {
  id: string;
  name: string;
  available: boolean;
};

export function DraggableSection({ id, name, available }: DraggableSectionProps) {
  // Ensure section is completely undraggable if not available
  const isDraggableDisabled = !available;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isDraggableDisabled,
  });

  // Use CSS.Transform from dnd-kit utilities for better cross-browser support
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : undefined,
    // Complete invisibility when dragging to avoid the zoom issue
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? -1 : undefined, // Push it behind other elements when dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      suppressHydrationWarning
      className={`p-3 rounded-md transition-colors duration-200 
        ${available 
          ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 cursor-move' 
          : 'opacity-40 cursor-not-allowed bg-gray-800/20 border border-gray-800'}`}
    >
      <div className="flex items-center">
        <div className="font-medium">{name}</div>
        {!available && (
          <div className="ml-2 text-xs text-gray-400 italic">(Used)</div>
        )}
      </div>
    </div>
  );
}
