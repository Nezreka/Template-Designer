'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/navbar';
import { Sidebar } from '../components/layout/sidebar';
import { MainArea } from '../components/builder/main-area';
import { BuilderProvider, useBuilder } from '../components/builder/context';
import { DragDropProvider } from '../components/builder/dnd-provider';
import { TemplateSelectionModal } from '../components/builder/template-selection-modal';

// App layout wrapped with BuilderProvider
function AppLayout() {
  const { pendingSection, setTemplateForSection, clearPendingSection } = useBuilder();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  
  // When pendingSection changes, open the modal
  useEffect(() => {
    if (pendingSection) {
      setTemplateModalOpen(true);
    } else {
      setTemplateModalOpen(false);
    }
  }, [pendingSection]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setTemplateForSection(templateId);
  };

  // Handle modal close
  const handleModalClose = () => {
    clearPendingSection();
    setTemplateModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <DragDropProvider>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainArea />
        </div>
      </DragDropProvider>

      {/* Template Selection Modal */}
      {pendingSection && (
        <TemplateSelectionModal
          sectionType={pendingSection.sectionTypeId}
          onSelect={handleTemplateSelect}
          onClose={handleModalClose}
          open={templateModalOpen}
        />
      )}
    </div>
  );
}

// Main page component
export default function Home() {
  return (
    <BuilderProvider>
      <AppLayout />
    </BuilderProvider>
  );
}