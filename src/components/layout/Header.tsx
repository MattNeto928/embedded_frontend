import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { authState, signOut, viewAsStudent, toggleViewAsStudent } = useAuth();
  const { isAuthenticated, user } = authState;

  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">
            ECE 4180
          </Link>
          <span className="ml-2 text-sm bg-primary-600 px-2 py-1 rounded">
            ESP32-C6 Lab
          </span>
        </div>

        <nav>
          <ul className="flex space-x-6">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/" className="hover:text-primary-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/course" className="hover:text-primary-200">
                    Course Materials
                  </Link>
                </li>
                <li>
                  <Link to="/labs" className="hover:text-primary-200">
                    Labs
                  </Link>
                </li>
                {user?.role === 'staff' && !viewAsStudent && (
                  <>
                    <li>
                      <Link to="/people" className="hover:text-primary-200">
                        People
                      </Link>
                    </li>
                    <li>
                      <Link to="/checkoffs" className="hover:text-primary-200">
                        Check Offs
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <div className="flex items-center">
                    <span className="mr-4">
                      {user?.username} ({user?.role})
                    </span>
                    {user?.role === 'staff' && (
                      <button
                        onClick={toggleViewAsStudent}
                        className={`mr-2 px-3 py-1 rounded ${
                          viewAsStudent
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {viewAsStudent ? 'Click for Staff View' : 'Click for Student View'}
                      </button>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="bg-primary-800 hover:bg-primary-900 px-3 py-1 rounded"
                    >
                      Sign Out
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/signin" className="hover:text-primary-200">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="bg-primary-500 hover:bg-primary-600 px-3 py-1 rounded"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
