import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { authState } = useAuth();
  const { isAuthenticated, user } = authState;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ECE 4180: Embedded Systems Design</h1>
        <p className="text-xl text-gray-600">ESP32-C6 Development Platform</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        {isAuthenticated ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome back, {user?.username}!</h2>
            <p className="mb-4">
              You are logged in as a <span className="font-semibold">{user?.role}</span>.
            </p>
            {user?.role === 'student' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="font-medium">
                  Continue working on your labs and track your progress.
                </p>
              </div>
            )}
            {user?.role === 'staff' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <p className="font-medium">
                  Access the admin dashboard to manage students and labs.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome to the ECE 4180 Course Portal</h2>
            <p className="mb-4">
              Please sign in to access course materials and lab submissions.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-3">Course Overview</h2>
          <p className="mb-4">
            This course focuses on embedded systems design using the ESP32-C6 development platform.
            Students will learn about microcontroller architecture, wireless communication protocols,
            and real-time operating systems.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Hands-on experience with ESP32-C6</li>
            <li>WiFi and Bluetooth connectivity</li>
            <li>Sensor integration and IoT applications</li>
            <li>Real-time operating systems</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-3">Lab Structure</h2>
          <p className="mb-4">
            The course consists of 6 lab assignments that build upon each other:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Introduction to ESP32-C6 and Assembly Programming</li>
            <li>GPIO and Interrupt Handling</li>
            <li>Timers and PWM</li>
            <li>Communication Protocols (I2C, SPI, UART)</li>
            <li>WiFi and Bluetooth Connectivity</li>
            <li>Final Project: IoT Application</li>
          </ol>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-3">Getting Started</h2>
        <p className="mb-4">
          To begin working with the ESP32-C6 development kit, follow these steps:
        </p>
        <ol className="list-decimal pl-5 space-y-2 mb-4">
          <li>Set up the ESP-IDF development environment</li>
          <li>Connect your ESP32-C6 DevKit to your computer</li>
          <li>Complete the initial setup lab to verify your environment</li>
          <li>Submit your first video demonstration</li>
        </ol>
        <p>
          Detailed instructions for each lab are available in the course materials section.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
