import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lab, LabStatus } from '../types';
import { API_ENDPOINT } from '../aws-config';
import ReactMarkdown from 'react-markdown';
import StructuredLabContent from '../components/labs/content/StructuredLabContent';

const LabDetailPage: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [lab, setLab] = useState<(Lab & Partial<LabStatus>) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isStudent = authState.user?.role === 'student';

  const fetchLabDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_ENDPOINT}labs/${labId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          // For locked labs, redirect back to labs list with a message
          const errorData = await response.json();
          console.error('Lab access denied:', errorData);
          
          // Store the error message in sessionStorage to display it on the labs page
          sessionStorage.setItem('labAccessError',
            errorData.message || 'This lab is currently locked. Please wait for your instructor to unlock it.');
          
          // Redirect back to labs list immediately
          navigate('/labs', { replace: true });
          return;
        }
        throw new Error('Failed to fetch lab details');
      }
      
      const data = await response.json();
      console.log('Lab data received:', data);
      setLab(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching lab details:', err);
    } finally {
      setLoading(false);
    }
  }, [labId, navigate, API_ENDPOINT]);
  
  // Initial fetch of lab details
  useEffect(() => {
    fetchLabDetails();
  }, [fetchLabDetails]);
  
  // If the user is a student and the lab is locked, redirect to labs page
  useEffect(() => {
    if (lab && isStudent && lab.locked) {
      console.log('Student attempting to access locked lab, redirecting...');
      sessionStorage.setItem('labAccessError',
        'This lab is currently locked. Please wait for your instructor to unlock it.');
      navigate('/labs', { replace: true });
    }
  }, [lab, isStudent, navigate]);

  // Handle lab not found case
  useEffect(() => {
    if (!loading && !lab && !error) {
      console.log('Lab not found, showing error');
      setError('Lab not found');
    }
  }, [loading, lab, error]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/labs')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Back to Labs
        </button>
      </div>
    );
  }

  // Render logic starts here

  if (!lab && !loading && !error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Lab not found
        </div>
        <button
          onClick={() => navigate('/labs')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Back to Labs
        </button>
      </div>
    );
  }

  // Only render the lab content if lab is not null
  if (lab) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/labs')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Labs
          </button>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="bg-primary-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">{lab.title}</h1>
            <p className="text-primary-100 mb-2">{lab.description}</p>
          </div>
          
          <div className="p-6">
            {lab.status === 'locked' && (
              <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                This lab is locked.
              </div>
            )}
            
            {lab.status === 'unlocked' && (
              <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded-md mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        
        {lab.structuredContent ? (
          // Render structured content if available
          <StructuredLabContent content={lab.structuredContent} />
        ) : lab.content ? (
          // Fall back to traditional markdown content
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 max-w-none markdown-content">
              <ReactMarkdown>{lab.content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          // Show a message if no content is available
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700">No content available for this lab.</p>
          </div>
        )}
      </div>
    );
  }
  
  // Show loading or error state
  return (
    <div className="max-w-4xl mx-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error || "Lab not found"}
        </div>
      )}
      <button
        onClick={() => navigate('/labs')}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Back to Labs
      </button>
    </div>
  );
};

export default LabDetailPage;