import React from 'react';
import { LabContent } from '../../../types';
import LabSection from './LabSection';

interface StructuredLabContentProps {
  content: LabContent;
}

const StructuredLabContent: React.FC<StructuredLabContentProps> = ({ content }) => {
  // Sort sections by order
  const sortedSections = [...content.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="structured-lab-content bg-white rounded-lg shadow-md p-6">
      <div className="mb-8">
        {sortedSections.map((section) => (
          <LabSection key={section.id} section={section} />
        ))}
      </div>
      
      {content.resources && content.resources.length > 0 && (
        <div className="mt-10 border-t pt-6">
          <h3 className="text-xl font-bold mb-4 text-primary-700">
            Additional Resources
          </h3>
          <div className="bg-gray-50 p-5 rounded-lg shadow-inner">
            <ul className="divide-y divide-gray-200">
              {content.resources.map((resource) => (
                <li key={resource.id} className="py-4">
                  <div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium text-lg flex items-center"
                    >
                      <span className="w-6 h-6 mr-3 inline-flex items-center justify-center bg-blue-100 text-blue-500 rounded-full">
                        {resource.type === 'document' && 'D'}
                        {resource.type === 'image' && 'I'}
                        {resource.type === 'video' && 'V'}
                        {resource.type === 'link' && 'L'}
                      </span>
                      {resource.title}
                    </a>
                    {resource.description && (
                      <p className="text-gray-600 mt-1 ml-9">{resource.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructuredLabContent;