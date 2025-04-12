import React, { useState } from 'react';
import { Button } from '../ui/button';
import { DroppableArea, SectionItem } from './droppable-area';
import { useBuilder } from './context';
import { PreviewModal } from './preview-modal';
import { ExportModal } from './export-modal';

export function MainArea() {
  const { builderSections } = useBuilder();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Template Builder</h2>
          <div className="flex space-x-3">
            <Button 
              className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
              onClick={() => setPreviewModalOpen(true)}
              disabled={builderSections.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Button>
            <Button 
              className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
              disabled={builderSections.length === 0}
              onClick={() => setExportModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Export
            </Button>
          </div>
        </div>
        
        <DroppableArea>
          {builderSections.length > 0 ? (
            <div className="space-y-4">
              {builderSections.map((section) => (
                <SectionItem key={section.id} section={section} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-6">
                <svg className="h-16 w-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Start Building Your Template</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Drag section types from the sidebar and drop them here to start building your custom template.
              </p>
            </div>
          )}
        </DroppableArea>
        
        {/* Preview Modal */}
        <PreviewModal 
          open={previewModalOpen} 
          onClose={() => setPreviewModalOpen(false)}
          onExport={() => setExportModalOpen(true)}
        />
        
        {/* Export Modal */}
        <ExportModal 
          open={exportModalOpen} 
          onClose={() => setExportModalOpen(false)} 
        />
      </div>
    </div>
  );
}