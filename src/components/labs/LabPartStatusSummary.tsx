import React from 'react';
import { LabPart, PartSubmission } from '../../types';

interface LabPartStatusSummaryProps {
  labId: string;
  labTitle: string;
  labParts: LabPart[];
  partSubmissions: Record<string, PartSubmission>;
}

const LabPartStatusSummary: React.FC<LabPartStatusSummaryProps> = ({
  labId,
  labTitle,
  labParts,
  partSubmissions
}) => {
  // Function to handle clicking on a part
  const handlePartClick = (partId: string) => {
    // Find the element to scroll to
    const element = document.getElementById(`lab-part-${partId}`);
    
    if (element) {
      // Scroll to the element smoothly
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  // Get status text and color for a part
  const getPartStatus = (partId: string) => {
    const submission = partSubmissions[partId];
    
    if (!submission) {
      // For lab0, show a special status indicating in-lab checkoff
      if (labId === 'lab0') {
        return {
          text: 'Checkoff in lab',
          color: 'blue',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300'
        };
      }
      
      return {
        text: 'Not submitted',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300'
      };
    }
    
    switch (submission.status) {
      case 'pending':
        return {
          text: 'Under review',
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        };
      case 'approved':
        return {
          text: 'Accepted',
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        };
      case 'rejected':
        return {
          text: 'Rejected',
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        };
      default:
        return {
          text: 'Not submitted',
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300'
        };
    }
  };

  // Sort parts by order
  const sortedParts = [...labParts].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 sticky top-4">
      <h2 className="text-xl font-bold mb-4 text-primary-700 border-b pb-2">
        Lab Progress
      </h2>
      
      <div className="mb-3">
        <h3 className="font-medium text-gray-700">{labTitle}</h3>
      </div>
      
      <div className="space-y-3">
        {sortedParts.map((part) => {
          const status = getPartStatus(part.partId);
          
          return (
            <div
              key={part.partId}
              className={`border ${status.borderColor} rounded-md p-3 ${status.bgColor} cursor-pointer hover:shadow-md transition-shadow duration-200`}
              onClick={() => handlePartClick(part.partId)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Part {part.order}: {part.title}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${status.bgColor} ${status.textColor} border ${status.borderColor}`}>
                  {status.text}
                </span>
              </div>
              
              {partSubmissions[part.partId]?.feedback && (
                <div className="mt-2 text-sm italic">
                  {partSubmissions[part.partId].feedback}
                </div>
              )}
            </div>
          );
        })}
        
        {sortedParts.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            No lab parts found
          </div>
        )}
      </div>
    </div>
  );
};

export default LabPartStatusSummary;