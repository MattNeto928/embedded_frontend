import React, { useState, useEffect, useMemo } from 'react';
import { LabContent, LabPart, PartSubmission } from '../../../types';
import LabSection from './LabSection';
import VideoPartUploader from '../../submissions/VideoPartUploader';
import { API_ENDPOINT } from '../../../aws-config';
import { useAuth } from '../../../contexts/AuthContext';

interface EnhancedLabContentProps {
  content: LabContent;
  labId: string;
  onLabPartsUpdate?: (parts: LabPart[]) => void;
  onPartSubmissionsUpdate?: (submissions: Record<string, PartSubmission>) => void;
}

const EnhancedLabContent: React.FC<EnhancedLabContentProps> = ({
  content,
  labId,
  onLabPartsUpdate,
  onPartSubmissionsUpdate
}) => {
  const { authState } = useAuth();
  const [labParts, setLabParts] = useState<LabPart[]>([]);
  const [partSubmissions, setPartSubmissions] = useState<Record<string, PartSubmission>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sort sections by order - memoized to prevent recreation on every render
  const sortedSections = useMemo(() => {
    return [...content.sections].sort((a, b) => a.order - b.order);
  }, [content.sections]);
  
  // Extract lab parts from the content
  useEffect(() => {
    // Look for sections with type 'instructions' that might contain parts
    const instructionSections = sortedSections.filter(
      section => section.type === 'instructions'
    );
    
    // Extract parts from section titles
    const extractedParts: LabPart[] = instructionSections.map((section, index) => {
      // Try to extract part number and title from section title
      // Example: "Part 1: Digital Output" -> { partId: "part1", title: "Digital Output" }
      const partMatch = section.title.match(/Part\s+(\d+):\s*(.*)/i);
      
      if (partMatch) {
        return {
          partId: `part${partMatch[1]}`,
          title: partMatch[2] || `Part ${partMatch[1]}`,
          description: typeof section.content === 'string'
            ? section.content.substring(0, 100) + '...'
            : `Part ${partMatch[1]} of the lab`,
          order: parseInt(partMatch[1]),
          requiresCheckoff: true,
          checkoffType: 'video'
        };
      }
      
      // Fallback if no part number found in title
      return {
        partId: `part${index + 1}`,
        title: section.title,
        description: typeof section.content === 'string'
          ? section.content.substring(0, 100) + '...'
          : `Part ${index + 1} of the lab`,
        order: index + 1,
        requiresCheckoff: true,
        checkoffType: 'video'
      };
    });
    
    setLabParts(extractedParts);
    
    // Notify parent component about lab parts
    if (onLabPartsUpdate) {
      onLabPartsUpdate(extractedParts);
    }
  }, [sortedSections, onLabPartsUpdate]); // Include onLabPartsUpdate in dependencies
  
  // Fetch existing submissions for this lab
  useEffect(() => {
    // Skip the effect if we don't have necessary data
    if (!labId || !authState.isAuthenticated) return;
    
    const fetchPartSubmissions = async () => {
      
      try {
        const token = localStorage.getItem('idToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Fix the URL by ensuring no double slashes
        const apiUrl = `${API_ENDPOINT.replace(/\/$/, '')}/part-submissions?labId=${labId}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch part submissions');
        }
        
        const data = await response.json();
        
        // Convert array to record keyed by partId for easy lookup
        const submissionsRecord: Record<string, PartSubmission> = {};
        data.forEach((submission: PartSubmission) => {
          submissionsRecord[submission.partId] = submission;
        });
        
        setPartSubmissions(submissionsRecord);
        
        // Notify parent component about part submissions
        if (onPartSubmissionsUpdate) {
          onPartSubmissionsUpdate(submissionsRecord);
        }
      } catch (err) {
        console.error('Error fetching part submissions:', err);
        // Don't set error state or loading state here to avoid UI issues
      }
    };
    
    fetchPartSubmissions();
    // API_ENDPOINT is missing from the dependency array and could cause issues
  }, [labId, authState.isAuthenticated, onPartSubmissionsUpdate, API_ENDPOINT]);
  
  const handleUploadComplete = (partId: string, submissionId: string, fileKey: string) => {
    // Create the updated submission object
    const updatedSubmission = {
      ...partSubmissions[partId],
      submissionId,
      fileKey,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as PartSubmission;
    
    // Update the local state with the new submission
    const updatedSubmissions = {
      ...partSubmissions,
      [partId]: updatedSubmission
    };
    
    setPartSubmissions(updatedSubmissions);
    
    // Notify parent component about part submissions
    if (onPartSubmissionsUpdate) {
      onPartSubmissionsUpdate(updatedSubmissions);
    }
  };
  
  // Render submission status for a part
  const renderSubmissionStatus = (partId: string) => {
    const submission = partSubmissions[partId];
    
    if (!submission) {
      return null;
    }
    
    switch (submission.status) {
      case 'pending':
        return (
          <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md mb-4">
            <p className="font-medium">Submission pending review</p>
            <p className="text-sm">Submitted on {new Date(submission.submittedAt).toLocaleDateString()}</p>
          </div>
        );
      case 'approved':
        return (
          <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded-md mb-4">
            <p className="font-medium">Submission approved!</p>
            <p className="text-sm">Approved on {new Date(submission.updatedAt).toLocaleDateString()}</p>
            {submission.feedback && (
              <p className="mt-2 italic">{submission.feedback}</p>
            )}
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-4">
            <p className="font-medium">Submission rejected</p>
            <p className="text-sm">Reviewed on {new Date(submission.updatedAt).toLocaleDateString()}</p>
            {submission.feedback && (
              <p className="mt-2 italic">{submission.feedback}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="structured-lab-content bg-white rounded-lg shadow-md p-6">
      <div className="mb-8">
        {sortedSections.map((section) => (
          <div key={section.id}>
            <LabSection section={section} />
            
            {/* Check if this section corresponds to a lab part that needs a video submission */}
            {section.type === 'instructions' && labParts.some(part => 
              part.title === section.title.replace(/Part\s+\d+:\s*/i, '') || 
              section.title.includes(`Part ${part.order}`)
            ) && (
              <div className="mt-4 mb-8">
                {labParts
                  .filter(part => 
                    part.title === section.title.replace(/Part\s+\d+:\s*/i, '') || 
                    section.title.includes(`Part ${part.order}`)
                  )
                  .map(part => (
                    <div
                      key={part.partId}
                      id={`lab-part-${part.partId}`}
                      className="border border-gray-200 rounded-lg p-4 mt-4"
                    >
                      <h3 className="text-lg font-semibold mb-2">Submit Video for {part.title}</h3>
                      
                      {/* Show submission status if available */}
                      {renderSubmissionStatus(part.partId)}
                      
                      {/* Only show uploader if not approved */}
                      {(!partSubmissions[part.partId] || 
                        partSubmissions[part.partId].status !== 'approved') && (
                        <VideoPartUploader 
                          labId={labId}
                          partId={part.partId}
                          partTitle={part.title}
                          onUploadComplete={(submissionId, fileKey) => 
                            handleUploadComplete(part.partId, submissionId, fileKey)
                          }
                        />
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
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

export default EnhancedLabContent;