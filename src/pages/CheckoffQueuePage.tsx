import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PartSubmission, QueueFilters } from '../types';
import { API_ENDPOINT } from '../aws-config';

const CheckoffQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [queue, setQueue] = useState<PartSubmission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<PartSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [filters, setFilters] = useState<QueueFilters>({
    status: 'pending',
    sortBy: 'submittedAt',
    sortDirection: 'asc'
  });
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0
  });

  // Helper function to format display name
  const formatDisplayName = (submission: PartSubmission): string => {
    if (submission.fullName) {
      return submission.fullName;
    }
    return submission.username;
  };

  // Helper function to get name status indicator
  const getNameStatusIndicator = (submission: PartSubmission): string => {
    if (!submission.fullName) {
      return ' (full name not found)';
    }
    return '';
  };

  // Fetch single submission by ID to refresh videoUrl
  const fetchSubmissionById = async (submissionId: string) => {
    const token = localStorage.getItem('idToken');
    if (!token) throw new Error('No authentication token found');
    const apiUrl = `${API_ENDPOINT.replace(/\/$/, '')}/part-submissions/${submissionId}`;
    const response = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch submission');
    return response.json();
  };

  // Check if user is staff
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role !== 'staff') {
      navigate('/');
    }
  }, [authState, navigate]);

  // Fetch the queue
  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('idToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.labId) queryParams.append('labId', filters.labId);
      if (filters.partId) queryParams.append('partId', filters.partId);
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);
      
      try {
        // Fix the URL by ensuring no double slashes
        const apiUrl = `${API_ENDPOINT.replace(/\/$/, '')}/part-submissions/queue?${queryParams.toString()}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // If the queue endpoint isn't available yet, fall back to getting all submissions
          if (response.status === 404) {
            console.warn('Queue endpoint not available, falling back to all submissions');
            return await fetchAllSubmissions(token);
          }
          throw new Error('Failed to fetch submission queue');
        }
        
        const data = await response.json();
        setQueue(data.items || []);
        setStats({
          totalCount: data.totalCount || 0,
          pendingCount: data.pendingCount || 0
        });
        
        // Set the current submission to the first one in the queue
        if (data.items && data.items.length > 0) {
          // Refresh the first item to ensure a fresh video URL
          try {
            const refreshed = await fetchSubmissionById(data.items[0].submissionId);
            setCurrentSubmission(refreshed);
          } catch {
            setCurrentSubmission(data.items[0]);
          }
        } else {
          setCurrentSubmission(null);
        }
      } catch (err) {
        // If there's an error with the queue endpoint, fall back to getting all submissions
        console.warn('Error with queue endpoint, falling back to all submissions:', err);
        return await fetchAllSubmissions(token);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching submission queue:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback function to get all submissions when queue endpoint isn't available
  const fetchAllSubmissions = async (token: string) => {
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      if (filters.sortDirection) {
        queryParams.append('sortDirection', filters.sortDirection);
      }

      // Fix the URL by ensuring no double slashes
      const apiUrl = `${API_ENDPOINT.replace(/\/$/, '')}/part-submissions?${queryParams.toString()}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();

      // Apply client-side filtering if needed (backend should handle this, but fallback)
      let filteredSubmissions = data;
      if (filters.status && filters.status !== 'all') {
        filteredSubmissions = data.filter((submission: PartSubmission) =>
          submission.status === filters.status
        );
      }

      // Sort by submission time
      const sortField = filters.sortBy || 'submittedAt';
      const sortDirection = filters.sortDirection || 'asc';

      filteredSubmissions.sort((a: PartSubmission, b: PartSubmission) => {
        const aValue = new Date(a[sortField as keyof PartSubmission] as string).getTime();
        const bValue = new Date(b[sortField as keyof PartSubmission] as string).getTime();

        if (sortDirection === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });

      // Count pending submissions for stats
      const pendingCount = data.filter((submission: PartSubmission) =>
        submission.status === 'pending'
      ).length;

      setQueue(filteredSubmissions);
      setStats({
        totalCount: data.length,
        pendingCount: pendingCount
      });

      // Set the current submission to the first one in the queue
      if (filteredSubmissions.length > 0) {
        setCurrentSubmission(filteredSubmissions[0]);
      } else {
        setCurrentSubmission(null);
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching all submissions:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchQueue();
    }
  }, [authState.isAuthenticated, filters]);

  // Handle submission approval
  const handleApprove = async () => {
    if (!currentSubmission) return;
    
    try {
      const token = localStorage.getItem('idToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fix the URL by ensuring no double slashes
      const apiUrl = `${API_ENDPOINT.replace(/\/$/, '')}/part-submissions/${currentSubmission.submissionId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved',
          feedback: feedback.trim() || 'Great job!'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve submission');
      }
      
      // Remove the current submission from the queue
      setQueue(queue.filter(item => item.submissionId !== currentSubmission.submissionId));
      
      // Move to the next submission
      if (queue.length > 1) {
        const nextIndex = queue.findIndex(item => item.submissionId === currentSubmission.submissionId) + 1;
        if (nextIndex < queue.length) {
          setCurrentSubmission(queue[nextIndex]);
        } else {
          setCurrentSubmission(queue[0]);
        }
      } else {
        setCurrentSubmission(null);
      }
      
      // Reset feedback
      setFeedback('');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingCount: Math.max(0, prev.pendingCount - 1)
      }));
    } catch (err) {
      setError((err as Error).message);
      console.error('Error approving submission:', err);
    }
  };

  // Handle submission rejection
  const handleReject = async () => {
    if (!currentSubmission) return;
    
    // Require feedback for rejections
    if (!feedback.trim()) {
      setError('Please provide feedback explaining why the submission was rejected');
      return;
    }
    
    try {
      const token = localStorage.getItem('idToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fix the URL by ensuring no double slashes
      const apiUrl = `${API_ENDPOINT.replace(/\/$/, '')}/part-submissions/${currentSubmission.submissionId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          feedback
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject submission');
      }
      
      // Remove the current submission from the queue
      setQueue(queue.filter(item => item.submissionId !== currentSubmission.submissionId));
      
      // Move to the next submission
      if (queue.length > 1) {
        const nextIndex = queue.findIndex(item => item.submissionId === currentSubmission.submissionId) + 1;
        if (nextIndex < queue.length) {
          setCurrentSubmission(queue[nextIndex]);
        } else {
          setCurrentSubmission(queue[0]);
        }
      } else {
        setCurrentSubmission(null);
      }
      
      // Reset feedback
      setFeedback('');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingCount: Math.max(0, prev.pendingCount - 1)
      }));
    } catch (err) {
      setError((err as Error).message);
      console.error('Error rejecting submission:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof QueueFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Select a specific submission from the queue
  const selectSubmission = (submission: PartSubmission) => {
    // Refresh on selection to ensure fresh presigned URL
    fetchSubmissionById(submission.submissionId)
      .then((refreshed) => setCurrentSubmission(refreshed))
      .catch(() => setCurrentSubmission(submission));
    setFeedback('');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkoff Queue</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkoff Queue</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Queue list */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Filters</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  value={filters.status || 'pending'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  value={filters.sortBy || 'submittedAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="submittedAt">Submission Date</option>
                  <option value="updatedAt">Last Updated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Direction</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  value={filters.sortDirection || 'asc'}
                  onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
                >
                  <option value="asc">Oldest First</option>
                  <option value="desc">Newest First</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">Queue</h2>
              <p className="text-sm text-gray-500">
                {stats.pendingCount} pending of {stats.totalCount} total submissions
              </p>
            </div>
            
            {queue.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No submissions in queue
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {queue.map((submission) => (
                  <li 
                    key={submission.submissionId}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      currentSubmission?.submissionId === submission.submissionId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => selectSubmission(submission)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {formatDisplayName(submission)}
                          <span className="text-xs text-gray-400">{getNameStatusIndicator(submission)}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Lab {submission.labId.replace('lab', '')}, Part {submission.partId.replace('part', '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {submission.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Main content - Current submission */}
        <div className="lg:col-span-2">
          {currentSubmission ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold mb-1">
                  {formatDisplayName(currentSubmission)}'s Submission
                  <span className="text-sm text-gray-400 font-normal">{getNameStatusIndicator(currentSubmission)}</span>
                </h2>
                <p className="text-gray-600">
                  Lab {currentSubmission.labId.replace('lab', '')}, Part {currentSubmission.partId.replace('part', '')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted on {new Date(currentSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <VideoPlayer
                    videoUrl={currentSubmission.videoUrl}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                
                {currentSubmission.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Student Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{currentSubmission.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md"
                    placeholder="Enter feedback for the student..."
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">No Submission Selected</h2>
              <p className="text-gray-500">
                {queue.length > 0 
                  ? 'Select a submission from the queue to review'
                  : 'There are no submissions in the queue'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoffQueuePage;