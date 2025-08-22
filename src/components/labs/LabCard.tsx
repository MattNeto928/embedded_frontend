import React from 'react';
import { Link } from 'react-router-dom';
import { Lab, LabStatus } from '../../types';

interface LabCardProps {
  lab: Lab;
  status?: LabStatus;
  isStaff?: boolean;
  viewAsStudent?: boolean;
}

const LabCard: React.FC<LabCardProps> = ({ lab, status, isStaff = false, viewAsStudent = false }) => {
  // Check if the lab is locked based on status
  const isLockedStatus = !status || status.status === 'locked';
  // For staff not in student view, they can access labs even if locked
  const isLocked = isStaff && !viewAsStudent ? false : isLockedStatus;
  const isCompleted = status?.completed;
  const hasSubmission = status?.submissionStatus;
  // Show lock indicator for staff even if they can access it
  const showLockIndicator = isLockedStatus;

  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
          Locked
        </span>
      );
    }

    if (isCompleted) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
          Completed
        </span>
      );
    }

    if (hasSubmission) {
      const submissionStatus = status?.submissionStatus;
      
      if (submissionStatus === 'approved') {
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
            Approved
          </span>
        );
      }
      
      if (submissionStatus === 'rejected') {
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
            Rejected
          </span>
        );
      }
      
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
          Pending Review
        </span>
      );
    }

    return (
      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded whitespace-nowrap">
        In Progress
      </span>
    );
  };

  return (
    <div className={`card h-full flex flex-col ${showLockIndicator ? 'border-red-200 bg-red-50' : 'border-green-200 bg-white'}`}>
      {showLockIndicator && (
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{lab.title}</h3>
        {getStatusBadge()}
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{lab.description}</p>
      
      <div className="flex justify-between items-center mt-auto">
        {isLocked ? (
          <button disabled className="btn-secondary opacity-50 cursor-not-allowed whitespace-nowrap">
            Locked
          </button>
        ) : (
          <Link to={`/labs/${lab.labId}`} className="btn-primary whitespace-nowrap">
            {isStaff && !viewAsStudent && showLockIndicator ? 'View Locked Lab' : (isCompleted ? 'Review Lab' : 'Continue Lab')}
          </Link>
        )}
        
        {status?.unlockedAt && (
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            Unlocked: {new Date(status.unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default LabCard;
