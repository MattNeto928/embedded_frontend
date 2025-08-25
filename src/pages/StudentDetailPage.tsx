import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINT } from '../aws-config';
import { StudentDetail, CheckoffUpdate } from '../types';

const StudentDetailPage: React.FC = () => {
  const { studentName } = useParams<{ studentName: string }>();
  const { authState } = useAuth();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'checkoffs'>('overview');
  const [editingGrade, setEditingGrade] = useState<{ labId: string, grade: number | null }>({ labId: '', grade: null });

  useEffect(() => {
    if (studentName) {
      fetchStudentDetails(studentName);
    }
  }, [studentName]);

  const fetchStudentDetails = async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_ENDPOINT}progress/${encodeURIComponent(name)}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }
      
      const data = await response.json();
      setStudent(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>, labId: string) => {
    const value = e.target.value;
    const grade = value === '' ? null : Number(value);
    setEditingGrade({ labId, grade });
  };

  const saveGrade = async (labId: string) => {
    if (!student) return;
    
    try {
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_ENDPOINT}progress/${encodeURIComponent(student.name)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          labId,
          grade: editingGrade.grade
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update grade');
      }
      
      // Update local state
      setStudent(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          progress: prev.progress.map(lab => 
            lab.labId === labId 
              ? { ...lab, grade: editingGrade.grade } 
              : lab
          )
        };
      });
      
      // Reset editing state
      setEditingGrade({ labId: '', grade: null });
      
    } catch (err) {
      console.error('Error updating grade:', err);
      alert('Failed to update grade: ' + (err as Error).message);
    }
  };

  const toggleCheckoff = async (labId: string, partId: string, currentStatus: boolean) => {
    if (!student) return;
    
    try {
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        throw new Error('No authentication token found');
      }
      
      const checkoffType = 'in-lab'; // Default to in-lab checkoff
      const newStatus = !currentStatus;
      
      const response = await fetch(`${API_ENDPOINT}progress/${encodeURIComponent(student.name)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          labId,
          partId,
          completed: newStatus,
          checkoffType: newStatus ? checkoffType : 'pending'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update checkoff status');
      }
      
      // Update local state
      setStudent(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          progress: prev.progress.map(lab => 
            lab.labId === labId 
              ? { 
                  ...lab, 
                  parts: lab.parts.map(part => 
                    part.partId === partId 
                      ? { 
                          ...part, 
                          completed: newStatus,
                          checkoffType: newStatus ? checkoffType : 'pending',
                          completedAt: newStatus ? new Date().toISOString() : undefined
                        } 
                      : part
                  )
                } 
              : lab
          )
        };
      });
      
    } catch (err) {
      console.error('Error updating checkoff status:', err);
      alert('Failed to update checkoff status: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error || 'Student not found'}</p>
        </div>
        <Link to="/people" className="text-blue-600 hover:text-blue-900">
          &larr; Back to People
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <Link to="/people" className="text-blue-600 hover:text-blue-900">
          &larr; Back to People
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Section {student.section}
              </span>
              {student.hasAccount ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Account Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  No Account
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${activeTab === 'checkoffs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setActiveTab('checkoffs')}
              >
                Check Offs
              </button>
            </div>
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Lab Progress</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {student.progress.map((lab) => (
                    <tr key={lab.labId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{lab.title}</div>
                        <div className="text-sm text-gray-500">{lab.labId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lab.status === 'unlocked' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Unlocked
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Locked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lab.completed ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingGrade.labId === lab.labId ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-16 px-2 py-1 border rounded-md"
                              value={editingGrade.grade === null ? '' : editingGrade.grade}
                              onChange={(e) => handleGradeChange(e, lab.labId)}
                            />
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() => saveGrade(lab.labId)}
                            >
                              Save
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => setEditingGrade({ labId: '', grade: null })}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{lab.grade !== null ? lab.grade : 'N/A'}</span>
                            <button
                              className="text-blue-600 hover:text-blue-900 text-sm"
                              onClick={() => setEditingGrade({ labId: lab.labId, grade: lab.grade })}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'checkoffs' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Lab Check Offs</h2>
            
            {student.progress.map((lab) => (
              <div key={lab.labId} className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{lab.title}</h3>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">Grade:</span>
                    {editingGrade.labId === lab.labId ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-16 px-2 py-1 border rounded-md"
                          value={editingGrade.grade === null ? '' : editingGrade.grade}
                          onChange={(e) => handleGradeChange(e, lab.labId)}
                        />
                        <button
                          className="text-green-600 hover:text-green-900 text-sm"
                          onClick={() => saveGrade(lab.labId)}
                        >
                          Save
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 text-sm"
                          onClick={() => setEditingGrade({ labId: '', grade: null })}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{lab.grade !== null ? lab.grade : 'N/A'}</span>
                        <button
                          className="text-blue-600 hover:text-blue-900 text-sm"
                          onClick={() => setEditingGrade({ labId: lab.labId, grade: lab.grade })}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  {lab.parts.length > 0 ? (
                    <div className="space-y-4">
                      {lab.parts.map((part) => (
                        <div key={part.partId} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-white rounded-md shadow-sm">
                          <div>
                            <div className="font-medium">{part.partId}</div>
                            <div className="text-sm text-gray-500">
                              {part.completed ? (
                                <>
                                  <span className="text-green-600">Completed</span>
                                  {part.completedAt && (
                                    <span className="ml-2">
                                      on {new Date(part.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="ml-2">
                                    via {part.checkoffType === 'in-lab' ? 'In-Lab Check Off' : 'Video Submission'}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-600">Not completed</span>
                              )}
                            </div>
                            {part.videoUrl && (
                              <div className="mt-1">
                                <a 
                                  href={part.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm"
                                >
                                  View Video Submission
                                </a>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 md:mt-0">
                            <button
                              className={`px-3 py-1 rounded-md ${
                                part.completed 
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                              onClick={() => toggleCheckoff(lab.labId, part.partId, part.completed)}
                            >
                              {part.completed ? 'Remove Check Off' : 'Mark as Completed'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No parts defined for this lab.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailPage;