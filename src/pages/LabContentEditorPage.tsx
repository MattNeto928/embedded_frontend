import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINT } from '../aws-config';
import { Lab } from '../types';
import LabContentPreview from '../components/labs/content/LabContentPreview';

const LabContentEditorPage: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [lab, setLab] = useState<Lab | null>(null);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Check if user is staff
  useEffect(() => {
    if (authState.user?.role !== 'staff') {
      navigate('/labs');
    }
  }, [authState.user, navigate]);

  // Fetch lab data
  useEffect(() => {
    const fetchLabData = async () => {
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
          throw new Error('Failed to fetch lab details');
        }
        
        const data = await response.json();
        setLab(data);
        
        // Format the JSON content for the editor
        const formattedJson = JSON.stringify(data, null, 2);
        setJsonContent(formattedJson);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching lab details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (labId) {
      fetchLabData();
    }
  }, [labId, API_ENDPOINT]);

  // Handle JSON content changes
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    setSaveSuccess(false);
  };

  // Validate JSON before saving
  const validateJson = (): boolean => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      return false;
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!validateJson()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      // Parse the JSON to send to the server
      const updatedLabData = JSON.parse(jsonContent);
      
      // Log detailed information about the data being sent
      console.log('Saving lab content:', updatedLabData);
      console.log('structuredContent present:', !!updatedLabData.structuredContent);
      if (updatedLabData.structuredContent) {
        console.log('structuredContent sections:', updatedLabData.structuredContent.sections?.length || 0);
        console.log('First section title:', updatedLabData.structuredContent.sections?.[0]?.title || 'No title');
      }
      
      // Make API call to update the lab content
      console.log(`Making PUT request to ${API_ENDPOINT}labs/${labId}`);
      console.log('Using idToken:', idToken?.substring(0, 10) + '...');
      
      // Log the request details for debugging
      const requestHeaders = {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      console.log('Request headers:', requestHeaders);
      
      const response = await fetch(`${API_ENDPOINT}labs/${labId}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(updatedLabData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Array.from(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = 'Failed to update lab content';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('Update response:', responseData);
      
      // Update the lab state with the updated data
      setLab(responseData.lab);
      
      // Show success message
      setSaveSuccess(true);
      
    } catch (err) {
      setError((err as Error).message);
      console.error('Error saving lab content:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && !lab) {
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/labs')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Labs
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`${
              saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {lab && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="bg-primary-700 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Editing: {lab.title}</h1>
            <p className="text-primary-100">Lab ID: {lab.labId}</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {saveSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>Changes saved successfully!</p>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex justify-end mb-4 space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            
            <div className={`${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'block'}`}>
              <div className="mb-6">
                <label htmlFor="jsonEditor" className="block text-sm font-medium text-gray-700 mb-2">
                  Edit Lab Content (JSON)
                </label>
                <textarea
                  id="jsonEditor"
                  value={jsonContent}
                  onChange={handleJsonChange}
                  className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  spellCheck="false"
                />
              </div>
              
              {showPreview && (
                <div className="preview-container">
                  <h3 className="block text-sm font-medium text-gray-700 mb-2">Preview</h3>
                  <div className="border border-gray-300 rounded-md p-4 overflow-auto h-96">
                    <LabContentPreview jsonContent={jsonContent} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`${
                  saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabContentEditorPage;