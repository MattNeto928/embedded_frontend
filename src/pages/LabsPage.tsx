import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LabCard from '../components/labs/LabCard';
import { Lab, LabStatus } from '../types';
import { API_ENDPOINT } from '../aws-config';
import ConfirmationPopup from '../components/ConfirmationPopup';

const LabsPage: React.FC = () => {
  const { authState, viewAsStudent } = useAuth();
  const [labs, setLabs] = useState<(Lab & Partial<LabStatus>)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for confirmation popup
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'lock' | 'unlock'>('unlock');
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  
  // State for success popup
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isStaff = authState.user?.role === 'staff';
  
  // Process labs for student view if needed
  const processedLabs = useMemo(() => {
    // Always use the locked property from the backend if available
    return labs.map((lab: Lab & Partial<LabStatus>) => {
      // If locked is undefined, set default (Lab 1 is unlocked by default)
      const isLocked = lab.locked !== undefined ? lab.locked : (lab.labId !== 'lab1');
      
      return {
        ...lab,
        locked: isLocked,
        status: isLocked ? 'locked' : 'unlocked',
        completed: lab.completed || false
      };
    });
  }, [labs]);

  useEffect(() => {
    fetchLabs();
    
    // Check for lab access error messages from redirects
    const labAccessError = sessionStorage.getItem('labAccessError');
    if (labAccessError) {
      setError(labAccessError);
      // Clear the error message from session storage
      sessionStorage.removeItem('labAccessError');
    }
  }, [isStaff, viewAsStudent]);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching labs from API');
      const response = await fetch(`${API_ENDPOINT}labs`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch labs');
      }
      
      const data = await response.json();
      console.log('Labs data from API:', data);
      console.log('Raw labs data details:', JSON.stringify(data.map((lab: any) => ({
        labId: lab.labId,
        title: lab.title,
        locked: lab.locked,
        status: lab.status
      }))));
      
      // Ensure each lab has locked and status properties
      const labsWithStatus = data.map((lab: Lab & Partial<LabStatus>) => {
        // If locked is undefined, set default (Lab 1 is unlocked by default)
        if (lab.locked === undefined) {
          lab.locked = lab.labId === 'lab1' ? false : true;
          console.log(`Setting default locked status for lab ${lab.labId} to ${lab.locked}`);
        } else {
          console.log(`Lab ${lab.labId} already has locked status: ${lab.locked}`);
        }
        
        // Ensure status is set based on locked property
        const updatedLab = {
          ...lab,
          status: lab.locked ? 'locked' : 'unlocked'
        };
        
        console.log(`Lab ${lab.labId} final status: ${updatedLab.status}`);
        return updatedLab;
      });
      
      console.log('Labs with status:', labsWithStatus);
      console.log('Processed labs details:', JSON.stringify(labsWithStatus.map((lab: Lab & Partial<LabStatus>) => ({
        labId: lab.labId,
        title: lab.title,
        locked: lab.locked,
        status: lab.status
      }))));
      
      setLabs(labsWithStatus);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching labs:', err);
    } finally {
      setLoading(false);
    }
  };

  const showUnlockConfirmation = (labId: string) => {
    setSelectedLabId(labId);
    setConfirmationAction('unlock');
    setShowConfirmation(true);
  };
  
  const showLockConfirmation = (labId: string) => {
    setSelectedLabId(labId);
    setConfirmationAction('lock');
    setShowConfirmation(true);
  };
  
  const handleConfirmAction = async () => {
    if (!selectedLabId) return;
    
    if (confirmationAction === 'unlock') {
      await handleUnlockLabForAll(selectedLabId);
    } else {
      await handleLockLabForAll(selectedLabId);
    }
    
    setShowConfirmation(false);
  };
  
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setSelectedLabId(null);
  };

  const handleUnlockLabForAll = async (labId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      // Ensure API_ENDPOINT ends with a slash
      const baseUrl = API_ENDPOINT.endsWith('/') ? API_ENDPOINT : `${API_ENDPOINT}/`;
      // Use the correct path format for unlocking labs
      const url = `${baseUrl}labs/${labId}/unlock`;
      
      console.log('Unlocking lab with URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Unlock response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.error || 'Failed to unlock lab');
      }
      
      const responseData = await response.json();
      console.log('Unlock response data:', responseData);
      
      // Update the lab status in the local state
      setLabs(prevLabs =>
        prevLabs.map(lab =>
          lab.labId === labId
            ? { ...lab, locked: false, status: 'unlocked' }
            : lab
        )
      );
      
      // Show success message
      setSuccessMessage('Lab unlocked successfully!');
      setShowSuccess(true);
      
      // Refresh labs after unlocking to get the updated status from the server
      await fetchLabs();
    } catch (err) {
      setError((err as Error).message);
      console.error('Error unlocking lab:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockLabForAll = async (labId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      // Ensure API_ENDPOINT ends with a slash
      const baseUrl = API_ENDPOINT.endsWith('/') ? API_ENDPOINT : `${API_ENDPOINT}/`;
      // Use the correct path format for locking labs
      const url = `${baseUrl}labs/${labId}/lock`;
      
      console.log('Locking lab with URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Lock response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.error || 'Failed to lock lab');
      }
      
      const responseData = await response.json();
      console.log('Lock response data:', responseData);
      
      // Update the lab status in the local state
      setLabs(prevLabs =>
        prevLabs.map(lab =>
          lab.labId === labId
            ? { ...lab, locked: true, status: 'locked' }
            : lab
        )
      );
      
      // Show success message
      setSuccessMessage('Lab locked successfully!');
      setShowSuccess(true);
      
      // Refresh labs after locking to get the updated status from the server
      await fetchLabs();
    } catch (err) {
      setError((err as Error).message);
      console.error('Error locking lab:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && labs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Labs</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Labs</h1>
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="font-bold">Access Restricted</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {processedLabs.map((lab) => (
          <div key={lab.labId} className="relative h-full">
            <div className="h-full">
              <LabCard
                lab={lab}
                status={lab as unknown as LabStatus}
                isStaff={isStaff}
                viewAsStudent={viewAsStudent}
              />
            </div>
            
            {isStaff && !viewAsStudent && (
              <div className="absolute top-2 right-2 z-10">
                {lab.status === 'locked' ? (
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 whitespace-nowrap flex items-center"
                    onClick={() => showUnlockConfirmation(lab.labId)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Unlock Lab For All
                  </button>
                ) : (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 whitespace-nowrap flex items-center"
                    onClick={() => showLockConfirmation(lab.labId)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Lock Lab For All
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {labs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No labs available.</p>
        </div>
      )}
      
      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmation}
        title={confirmationAction === 'unlock' ? 'Unlock Lab for All Students' : 'Lock Lab for All Students'}
        message={
          confirmationAction === 'unlock'
            ? 'This action will unlock the lab for ALL students in the class. Are you sure you want to proceed?'
            : 'This action will lock the lab for ALL students in the class. Are you sure you want to proceed?'
        }
        confirmText={confirmationAction === 'unlock' ? 'Unlock Lab' : 'Lock Lab'}
        confirmButtonColor={confirmationAction === 'unlock' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirmation}
      />
      
      {/* Success Popup */}
      <ConfirmationPopup
        isOpen={showSuccess}
        title="Success"
        message={successMessage}
        confirmText="OK"
        confirmButtonColor="bg-green-500 hover:bg-green-600"
        onConfirm={() => setShowSuccess(false)}
        onCancel={() => setShowSuccess(false)}
        isSuccess={true}
      />
    </div>
  );
};

export default LabsPage;
