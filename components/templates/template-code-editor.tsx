import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import Editor from '@monaco-editor/react';
import { useBuilder } from '../builder/context';

type TemplateCodeEditorProps = {
  sections: {
    id: string;
    sectionTypeId: string;
    html: string;
    css: string;
    js: string;
    order: number;
  }[];
  currentSectionIndex: number;
  onSectionIndexChange: (index: number) => void;
  onSectionUpdate: (index: number, field: 'html' | 'css' | 'js', value: string) => void;
  globalCss: string;
  globalJs: string;
  onGlobalCssChange: (value: string) => void;
  onGlobalJsChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

type EditorTab = 'html' | 'css' | 'js' | 'globalCss' | 'globalJs';

export default function TemplateCodeEditor({
  sections,
  currentSectionIndex,
  onSectionIndexChange,
  onSectionUpdate,
  globalCss,
  globalJs,
  onGlobalCssChange,
  onGlobalJsChange,
  onBack,
  onNext
}: TemplateCodeEditorProps) {
  const { sectionTypes } = useBuilder();
  // Set the initial tab based on whether we're editing global assets or a section
  const [currentTab, setCurrentTab] = useState<EditorTab>(currentSectionIndex === -1 ? 'globalCss' : 'html');

  // Get the current section (or null for global assets)
  const currentSection = currentSectionIndex >= 0 ? sections[currentSectionIndex] : null;
  
  // Update the current tab when switching between regular sections and global assets
  React.useEffect(() => {
    if (currentSectionIndex === -1) {
      // If switching to global assets, set tab to globalCss or globalJs
      if (currentTab !== 'globalCss' && currentTab !== 'globalJs') {
        setCurrentTab('globalCss');
      }
    } else {
      // If switching to a regular section, set tab to html, css, or js
      if (currentTab === 'globalCss' || currentTab === 'globalJs') {
        setCurrentTab('html');
      }
    }
  }, [currentSectionIndex, currentTab]);

  // Get section name for display
  const getSectionName = (sectionTypeId: string) => {
    const sectionType = sectionTypes.find(s => s.id === sectionTypeId);
    return sectionType?.name || sectionTypeId;
  };

  // Load example from Neptune template
  const loadExampleContent = () => {
    if (currentTab === 'html') {
      // Example HTML based on section type
      const htmlExamples: {[key: string]: string} = {
        'hero': `<section class="hero">
  <div class="hero-content">
    <h1>Hero Section</h1>
    <p>This is a hero section with a heading and some content.</p>
    <a href="#" class="cta-button">Learn More</a>
  </div>
</section>`,
        'welcome': `<section class="welcome">
  <div class="welcome-content">
    <h2>Welcome Section</h2>
    <p>This is a welcome section with some introductory text about the website or company.</p>
    <div class="welcome-features">
      <div class="feature">
        <h3>Feature 1</h3>
        <p>Description of feature 1.</p>
      </div>
      <div class="feature">
        <h3>Feature 2</h3>
        <p>Description of feature 2.</p>
      </div>
    </div>
  </div>
</section>`,
        'featured-areas': `<section class="featured-areas">
  <div class="featured-content">
    <h2>Featured Areas</h2>
    <div class="area-grid">
      <div class="area">
        <img src="area1.jpg" alt="Area 1">
        <h3>Area 1</h3>
        <p>Description of area 1.</p>
      </div>
      <div class="area">
        <img src="area2.jpg" alt="Area 2">
        <h3>Area 2</h3>
        <p>Description of area 2.</p>
      </div>
      <div class="area">
        <img src="area3.jpg" alt="Area 3">
        <h3>Area 3</h3>
        <p>Description of area 3.</p>
      </div>
    </div>
  </div>
</section>`,
        'stats': `<section class="stats">
  <div class="stats-content">
    <h2>Our Stats</h2>
    <div class="stats-grid">
      <div class="stat">
        <h3>100+</h3>
        <p>Clients</p>
      </div>
      <div class="stat">
        <h3>500+</h3>
        <p>Projects</p>
      </div>
      <div class="stat">
        <h3>10+</h3>
        <p>Years Experience</p>
      </div>
    </div>
  </div>
</section>`,
      };

      // Get example HTML for this section type or use a generic template
      const htmlExample = htmlExamples[currentSection.sectionTypeId] || 
        `<section class="${currentSection.sectionTypeId}">
  <div class="${currentSection.sectionTypeId}-content">
    <h2>${getSectionName(currentSection.sectionTypeId)}</h2>
    <p>This is the ${getSectionName(currentSection.sectionTypeId)} section content.</p>
  </div>
</section>`;

      onSectionUpdate(currentSectionIndex, 'html', htmlExample);
    } else if (currentTab === 'css') {
      // Basic CSS example for the current section
      const cssExample = `.${currentSection.sectionTypeId} {
  padding: 60px 0;
  background-color: #f5f5f5;
}

.${currentSection.sectionTypeId}-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.${currentSection.sectionTypeId} h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.${currentSection.sectionTypeId} p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 20px;
}`;

      onSectionUpdate(currentSectionIndex, 'css', cssExample);
    } else if (currentTab === 'js') {
      // Basic JS example
      const jsExample = `// JavaScript for ${getSectionName(currentSection.sectionTypeId)} section
document.addEventListener('DOMContentLoaded', () => {
  // Example: Select elements within this section
  const section = document.querySelector('.${currentSection.sectionTypeId}');
  
  // Example: Add event listeners
  if (section) {
    const buttons = section.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        console.log('Button clicked in ${getSectionName(currentSection.sectionTypeId)} section');
      });
    });
  }
});`;

      onSectionUpdate(currentSectionIndex, 'js', jsExample);
    } else if (currentTab === 'globalCss') {
      // Global CSS reset and common styles
      const globalCssExample = `/* Global CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.5em;
}

p {
  margin-bottom: 1rem;
}

a {
  color: #0066cc;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #004080;
}

/* Common Button Styles */
.button, .cta-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.3s ease;
}

.button:hover, .cta-button:hover {
  background-color: #004080;
}

/* Common Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Common Utility Classes */
.text-center {
  text-align: center;
}

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 3rem; }

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 3rem; }`;

      onGlobalCssChange(globalCssExample);
    } else if (currentTab === 'globalJs') {
      // Global JS for animations, lazy loading, etc.
      const globalJsExample = `// Global JavaScript

// Utilities for animations and lazy loading
document.addEventListener('DOMContentLoaded', () => {
  // Lazy load images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.add('loaded');
          imageObserver.unobserve(image);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }
  
  // Simple animation for elements with .animate class
  const animateElements = document.querySelectorAll('.animate');
  
  if ('IntersectionObserver' in window) {
    const animateObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          animateObserver.unobserve(entry.target);
        }
      });
    });
    
    animateElements.forEach(el => animateObserver.observe(el));
  } else {
    // Fallback
    animateElements.forEach(el => el.classList.add('animated'));
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});`;

      onGlobalJsChange(globalJsExample);
    }
  };

  // Handle editor content changes
  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    if (currentTab === 'html' || currentTab === 'css' || currentTab === 'js') {
      onSectionUpdate(currentSectionIndex, currentTab, value);
    } else if (currentTab === 'globalCss') {
      onGlobalCssChange(value);
    } else if (currentTab === 'globalJs') {
      onGlobalJsChange(value);
    }
  };

  // Get current editor value based on the active tab
  const getEditorValue = () => {
    if (currentSectionIndex === -1) {
      // Global assets
      if (currentTab === 'globalCss') return globalCss;
      if (currentTab === 'globalJs') return globalJs;
      return '';
    } else if (currentSection) {
      // Regular section
      if (currentTab === 'html') return currentSection.html;
      if (currentTab === 'css') return currentSection.css;
      if (currentTab === 'js') return currentSection.js;
    }
    return '';
  };

  // Get editor language based on the active tab
  const getEditorLanguage = () => {
    if (currentTab === 'html') return 'html';
    if (currentTab === 'css') return 'css';
    if (currentTab === 'js' || currentTab === 'globalJs') return 'javascript';
    if (currentTab === 'globalCss') return 'css';
    return 'html';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Section navigation tabs */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center overflow-x-auto pb-2">
          <span className="text-sm text-gray-400 mr-3 whitespace-nowrap">Sections:</span>
          <div className="flex space-x-1">
            {sections.map((section, index) => (
              <button
                key={section.id}
                className={`py-1 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentSectionIndex === index 
                    ? 'bg-gray-800 text-indigo-300 border border-indigo-500' 
                    : 'text-gray-400 hover:text-gray-200 border border-gray-700'
                }`}
                onClick={() => onSectionIndexChange(index)}
              >
                {index + 1}. {getSectionName(section.sectionTypeId)}
              </button>
            ))}
            <button
              className={`py-1 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                currentSectionIndex === -1 
                  ? 'bg-gray-800 text-indigo-300 border border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200 border border-gray-700'
              }`}
              onClick={() => onSectionIndexChange(-1)}
            >
              Global Assets
            </button>
          </div>
        </div>
        
        <Button
          onClick={loadExampleContent}
          className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md text-sm py-1 px-3 whitespace-nowrap ml-2"
        >
          Load Example Content
        </Button>
      </div>

      {/* Editor tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        {currentSectionIndex >= 0 ? (
          <>
            <button
              className={`py-2 px-4 text-sm font-medium transition-colors ${
                currentTab === 'html' 
                  ? 'text-indigo-300 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setCurrentTab('html')}
            >
              HTML
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium transition-colors ${
                currentTab === 'css' 
                  ? 'text-indigo-300 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setCurrentTab('css')}
            >
              CSS
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium transition-colors ${
                currentTab === 'js' 
                  ? 'text-indigo-300 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setCurrentTab('js')}
            >
              JavaScript
            </button>
          </>
        ) : (
          <>
            <button
              className={`py-2 px-4 text-sm font-medium transition-colors ${
                currentTab === 'globalCss' 
                  ? 'text-indigo-300 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setCurrentTab('globalCss')}
            >
              Global CSS
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium transition-colors ${
                currentTab === 'globalJs' 
                  ? 'text-indigo-300 border-b-2 border-indigo-500' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setCurrentTab('globalJs')}
            >
              Global JavaScript
            </button>
          </>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 border border-gray-700 rounded-md overflow-hidden">
        <Editor
          height="100%"
          language={getEditorLanguage()}
          theme="vs-dark"
          value={getEditorValue()}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            fontSize: 14,
            tabSize: 2,
            lineNumbers: 'on',
            renderValidationDecorations: 'on',
            folding: true,
            automaticLayout: true,
            fixedOverflowWidgets: true, // Makes error messages float on top instead of being clipped
          }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={onBack}
          className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-gray-900 hover:bg-gray-800 backdrop-blur-md border border-gray-700 text-indigo-300 font-medium shadow-md"
        >
          Next: Review
        </Button>
      </div>
    </div>
  );
}