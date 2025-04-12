import React, { useState } from 'react';
import { useBuilder } from './context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

type ExportModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { generateExport } = useBuilder();
  const [fileName, setFileName] = useState('my-template');
  const [exportFormat, setExportFormat] = useState<'combined' | 'separate'>('combined');
  
  // Download the generated content
  const handleExport = () => {
    // Extract the base name without extension
    const title = fileName.replace(/\.html$/, '');
    
    // Generate the content with the title option
    const content = generateExport(exportFormat, { title });
    
    if (!content.html) {
      alert('No sections to export.');
      return;
    }
    
    // For combined format, download single HTML file
    if (exportFormat === 'combined') {
      downloadFile(content.html, `${fileName}${fileName.endsWith('.html') ? '' : '.html'}`, 'text/html');
      
      // Close the modal after download starts
      onClose();
      return;
    }
    
    // For separate format, create a zip file with multiple files
    // Since we don't have a zip library here, we'll do individual downloads
    // In a real implementation, you might want to use JSZip or similar
    
    // Download HTML file
    downloadFile(content.html, `${fileName}${fileName.endsWith('.html') ? '' : '.html'}`, 'text/html');
    
    // Download CSS file if it exists
    if (content.css) {
      setTimeout(() => {
        downloadFile(content.css!, `styles.css`, 'text/css');
      }, 500);
    }
    
    // Download JS file if it exists
    if (content.js) {
      setTimeout(() => {
        downloadFile(content.js!, `scripts.js`, 'text/javascript');
      }, 1000);
    }
    
    // Close the modal after all downloads start
    setTimeout(() => {
      onClose();
    }, 1500);
  };
  
  // Helper function to download a file
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Export Template
          </DialogTitle>
          <DialogDescription>
            Save your template as an HTML file that can be used on your website.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Export Format */}
          <div>
            <h4 className="text-md font-medium mb-3">Export Format</h4>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`p-4 border rounded-md cursor-pointer transition-all ${
                  exportFormat === 'combined' 
                    ? 'bg-indigo-800/30 border-indigo-500 shadow-md' 
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                }`}
                onClick={() => setExportFormat('combined')}
              >
                <div className="font-medium mb-1">Combined File</div>
                <div className="text-xs text-gray-400">
                  Single HTML file with embedded CSS and JavaScript
                </div>
              </div>
              <div 
                className={`p-4 border rounded-md cursor-pointer transition-all ${
                  exportFormat === 'separate' 
                    ? 'bg-indigo-800/30 border-indigo-500 shadow-md' 
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                }`}
                onClick={() => setExportFormat('separate')}
              >
                <div className="font-medium mb-1">Separate Files</div>
                <div className="text-xs text-gray-400">
                  HTML, CSS, and JavaScript as separate files
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="bg-gray-700" />
          
          {/* File Naming */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {exportFormat === 'combined' ? 'File Name' : 'Base File Name'}
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="ml-2 text-gray-400">
                {exportFormat === 'combined' ? '.html' : '.html/.css/.js'}
              </span>
            </div>
            
            {exportFormat === 'separate' && (
              <p className="text-xs text-gray-400 mt-2">
                Will generate: {fileName}.html, styles.css, and scripts.js
              </p>
            )}
          </div>
          
          <Separator className="bg-gray-700" />
          
          {/* File Contents */}
          <div className="text-sm text-gray-400">
            <p>Your template will include:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>All HTML sections in the order you arranged them</li>
              <li>Combined CSS styles from all sections</li>
              <li>Combined JavaScript from all sections</li>
              <li>Basic reset styles for consistent display</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
          >
            Download Design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}