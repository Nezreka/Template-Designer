import React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

// Reuse section types from our builder context
import { useBuilder } from '../builder/context';

type TemplateSectionBuilderProps = {
  selectedSections: any[];
  onSectionSelect: (sectionTypeId: string) => void;
  onSectionRemove: (index: number) => void;
  onNext: () => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
};

export default function TemplateSectionBuilder({
  selectedSections,
  onSectionSelect,
  onSectionRemove,
  onNext,
  templateName,
  onTemplateNameChange
}: TemplateSectionBuilderProps) {
  const { sectionTypes } = useBuilder();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <label htmlFor="template-name" className="block text-sm font-medium mb-2">
          Template Name
        </label>
        <input
          id="template-name"
          type="text"
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={templateName}
          onChange={(e) => onTemplateNameChange(e.target.value)}
          placeholder="Enter a name for your template"
        />
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Available sections */}
        <div className="w-1/2 overflow-auto">
          <h3 className="text-lg font-medium mb-2">Available Sections</h3>
          <p className="text-sm text-gray-400 mb-4">Click on a section to add it to your template</p>
          
          <div className="space-y-2">
            {sectionTypes.map((section) => {
              const isSelected = selectedSections.some(s => s.sectionTypeId === section.id);
              return (
                <div
                  key={section.id}
                  className={`p-3 rounded-md transition-colors duration-200 cursor-pointer
                    ${isSelected 
                      ? 'bg-indigo-800/30 border border-indigo-500' 
                      : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
                    }`}
                  onClick={() => !isSelected && onSectionSelect(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{section.name}</div>
                    {isSelected && (
                      <span className="text-xs text-indigo-300">Added</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator orientation="vertical" className="bg-gray-700" />

        {/* Selected sections */}
        <div className="w-1/2 overflow-auto">
          <h3 className="text-lg font-medium mb-2">Selected Sections</h3>
          <p className="text-sm text-gray-400 mb-4">Sections that will be included in your template (drag to reorder)</p>
          
          {selectedSections.length > 0 ? (
            <div className="space-y-2">
              {selectedSections.map((section, index) => {
                const sectionType = sectionTypes.find(s => s.id === section.sectionTypeId);
                return (
                  <div
                    key={section.id}
                    className="p-3 rounded-md bg-gray-800/50 border border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-gray-200 mr-3">{index + 1}.</span>
                      <span className="font-medium">{sectionType?.name || section.sectionTypeId}</span>
                    </div>
                    <button
                      onClick={() => onSectionRemove(index)}
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 border border-dashed border-gray-700 rounded-md">
              <p>No sections selected yet</p>
              <p className="text-sm mt-2">Add sections from the left panel</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={onNext}
          disabled={selectedSections.length === 0 || !templateName.trim()}
          className={`${
            selectedSections.length > 0 && templateName.trim()
              ? 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-indigo-300'
              : 'bg-gray-900/50 border-gray-800 text-gray-500 cursor-not-allowed'
          } backdrop-blur-md border font-medium shadow-md`}
        >
          Next: Edit Content
        </Button>
      </div>
    </div>
  );
}