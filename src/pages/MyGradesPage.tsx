import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINT } from '../aws-config';
import { Lab } from '../types';

// Define a custom interface for the progress data structure
interface ProgressData {
  student: {
    name: string;
    section: string;
    hasAccount: boolean;
  };
  labs: {
    labId: string;
    title: string;
    status: 'locked' | 'unlocked';
    completed: boolean;
    grade: number | null;
    parts: {
      partId: string;
      title?: string;
      description?: string;
      completed: boolean;
      completedAt?: string;
      checkoffType?: string;
      submissionStatus?: string;
    }[];
  }[];
}

const MyGradesPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authState.isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Fetch labs and progress data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('idToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch all labs
        const labsResponse = await fetch(`${API_ENDPOINT}/labs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!labsResponse.ok) {
          throw new Error('Failed to fetch labs');
        }

        const labsData = await labsResponse.json();
        setLabs(labsData);

        // Fetch student progress
        // For students, we'll use their own progress
        // Try different possible identifiers
        const studentId = authState.user?.username || '';
        const studentEmail = authState.user?.username || ''; // In many cases username is email
        const studentIdFromToken = authState.user?.studentId || '';
        
        // Fix the API endpoint to avoid double slashes
        const baseUrl = API_ENDPOINT.endsWith('/') ? API_ENDPOINT.slice(0, -1) : API_ENDPOINT;
        
        // First try with studentId from token if available
        let progressResponse;
        if (studentIdFromToken) {
          console.log('Trying with studentId from token:', studentIdFromToken);
          progressResponse = await fetch(`${baseUrl}/progress/${encodeURIComponent(studentIdFromToken)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (progressResponse.ok) {
            console.log('Successfully fetched progress with studentId from token');
          }
        }
        
        // If that didn't work or wasn't available, try with username
        if (!progressResponse || !progressResponse.ok) {
          console.log('Trying with username:', studentId);
          progressResponse = await fetch(`${baseUrl}/progress/${encodeURIComponent(studentId)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (progressResponse.ok) {
            console.log('Successfully fetched progress with username');
          }
        }
        
        // If that fails, try with email
        if (!progressResponse || !progressResponse.ok) {
          console.log('Trying with email as identifier:', studentEmail);
          progressResponse = await fetch(`${baseUrl}/progress/${encodeURIComponent(studentEmail)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (progressResponse.ok) {
            console.log('Successfully fetched progress with email');
          }
        }

        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress data');
        }

        const progressData = await progressResponse.json();
        setProgressData(progressData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authState.isAuthenticated, authState.user, navigate, API_ENDPOINT]);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'locked':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Grades</h1>
      
      {progressData && progressData.labs && progressData.labs.length > 0 ? (
        <div className="space-y-8">
          {progressData.labs.map((lab) => (
            <div key={lab.labId} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-primary-700 text-white p-4">
                <h2 className="text-xl font-semibold flex justify-between items-center">
                  <span>{lab.title}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${lab.status === 'locked' ? 'bg-gray-500' : 'bg-green-500'}`}>
                    {lab.status === 'locked' ? 'Locked' : 'Unlocked'}
                  </span>
                </h2>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Overall Progress:</span>
                    <span className="font-medium">
                      {lab.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  
                  {lab.grade !== null && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Grade:</span>
                      <span className="font-medium">{lab.grade}%</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-medium mb-3">Lab Parts</h3>
                
                {lab.parts && lab.parts.length > 0 ? (
                  <div className="space-y-3">
                    {lab.parts.map((part) => (
                      <div 
                        key={part.partId} 
                        className={`border rounded-md p-3 ${part.completed ? 'border-green-300' : 'border-gray-300'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{part.title || part.partId}</span>
                          <span className={`text-sm px-2 py-1 rounded-md ${getStatusColor(part.submissionStatus || '')}`}>
                            {part.completed ? 'Completed' : part.submissionStatus || 'Not Started'}
                          </span>
                        </div>
                        
                        {part.description && (
                          <p className="text-sm text-gray-600 mt-1">{part.description}</p>
                        )}
                        
                        {part.completedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Completed on {new Date(part.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No parts available for this lab.</p>
                )}
                
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/labs/${lab.labId}`)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                    disabled={lab.status === 'locked'}
                  >
                    {lab.status === 'locked' ? 'Lab Locked' : 'Go to Lab'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error ? error : "No progress data available. You haven't started any labs yet."}
        </div>
      )}
    </div>
  );
};

export default MyGradesPage;