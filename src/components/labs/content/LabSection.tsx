import React from 'react';
import { LabSection as LabSectionType, LabContentBlock } from '../../../types';
import ContentBlock from './ContentBlock';

interface LabSectionProps {
  section: LabSectionType;
}

const LabSection: React.FC<LabSectionProps> = ({ section }) => {
  // Get the appropriate color based on section type
  const getSectionStyles = () => {
    switch (section.type) {
      case 'introduction':
        return { color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'objectives':
        return { color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'requirements':
        return { color: 'text-purple-600', bgColor: 'bg-purple-50' };
      case 'instructions':
        return { color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
      case 'submission':
        return { color: 'text-orange-600', bgColor: 'bg-orange-50' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const { color, bgColor } = getSectionStyles();

  // Render content blocks if content is an array, otherwise render as markdown
  const renderContent = () => {
    // Add special handling for sections that typically contain lists
    const isList = section.type === 'objectives' || section.type === 'requirements';
    
    if (Array.isArray(section.content)) {
      return section.content.map((block: LabContentBlock, index: number) => {
        // For text blocks in list sections, ensure proper list formatting
        if (isList && block.type === 'text' && typeof block.content === 'string') {
          // Clone the block to avoid mutating the original
          const enhancedBlock = { ...block };
          
          // Ensure each line that should be a list item starts with a bullet point
          if (!enhancedBlock.content.includes('\n- ') && !enhancedBlock.content.includes('\n* ')) {
            enhancedBlock.content = enhancedBlock.content
              .split('\n')
              .map(line => {
                // Skip lines that are headers or already formatted
                if (line.startsWith('#') || line.trim() === '' || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                  return line;
                }
                return '- ' + line.trim();
              })
              .join('\n');
          }
          
          return <ContentBlock key={index} block={enhancedBlock} />;
        }
        
        return <ContentBlock key={index} block={block} />;
      });
    } else {
      // If content is a string, create a text block
      return (
        <ContentBlock
          block={{
            type: 'text',
            content: section.content
          }}
        />
      );
    }
  };

  return (
    <div className="mb-8" data-section-type={section.type}>
      <div className={`p-4 rounded-t-lg ${bgColor} border-b-2 border-${color.replace('text-', '')}`}>
        <h2 className={`text-xl font-bold ${color}`}>{section.title}</h2>
      </div>
      <div className="bg-white p-6 rounded-b-lg shadow-md border border-gray-200">
        {renderContent()}
      </div>
    </div>
  );
};

export default LabSection;