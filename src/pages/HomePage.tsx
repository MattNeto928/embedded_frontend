import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { authState } = useAuth();
  const { isAuthenticated, user } = authState;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">ECE 4180: Embedded Systems Design</h1>
        <p className="text-xl text-gray-600">ESP32-C6-DevKitC-1 Development Platform</p>
        <div className="mt-4 flex flex-col md:flex-row justify-center gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-md">
            <p className="font-medium">Section A: 3:30 - 4:45PM T/R in Klaus 2456</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-md">
            <p className="font-medium">Section B: 3:30 - 4:45PM M/W in Klaus 2447</p>
          </div>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-3">Course Overview</h2>
          <p className="mb-4">
            This course covers hardware and software design for higher embedded systems. Concepts that can be applied to any embedded system will be covered, including I/O principles, communication protocols, real-time operating systems, interrupts, memory hierarchy, and power management—all in the scope of an embedded system.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Hands-on experience with ESP32-C6</li>
            <li>Bare-metal programming and hardware control</li>
            <li>Wired and wireless communication protocols</li>
            <li>Real-time operating systems and machine learning</li>
            <li>Sensor integration and IoT applications</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-3">Lab Structure</h2>
          <p className="mb-4">
            The course consists of 5 lab assignments that build upon each other:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Lab 0: Introduction to the ESP32 and Development Environment Setup</li>
            <li>Lab 1: Bare-Metal I/O and Signal Processing</li>
            <li>Lab 2: Wired Communication Protocols and Actuators</li>
            <li>Lab 3: Interrupts and Wireless Communication</li>
            <li>Lab 4: RTOS, Timers, and On-Device Machine Learning</li>
          </ol>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-3">Course Objectives</h2>
        <p className="mb-4">By the end of this course, you will be able to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Identify Embedded Systems in the real world along with the problem(s) they solve and how they do so</li>
          <li>Design Embedded Systems using a microcontroller connected to many different peripherals and I/O devices</li>
          <li>Understand how microcontrollers and peripherals communicate with each other using different protocols</li>
          <li>Write software for Embedded Systems with and without APIs in both high-level and low-level languages</li>
          <li>Understand hardware timers with respect to the processor's clock</li>
          <li>Analyze and create a real-time system to be deployed on an Embedded System</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-3">Course Staff</h2>
          <div className="mb-4">
            <h3 className="font-semibold">Instructor</h3>
            <p>Diego Fratta (He/Him/His)</p>
            <p>Email: <a href="mailto:fratta@gatech.edu" className="text-blue-600 hover:underline">fratta@gatech.edu</a></p>
            <p>Office: Klaus 3354</p>
          </div>
          <div>
            <h3 className="font-semibold">Teaching Assistants</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>GTA: Barry Walker - <a href="mailto:bwalker96@gatech.edu" className="text-blue-600 hover:underline">bwalker96@gatech.edu</a></li>
              <li>UTA: Trevor Goo - <a href="mailto:tgoo3@gatech.edu" className="text-blue-600 hover:underline">tgoo3@gatech.edu</a></li>
              <li>UTA: Jason Hsiao - <a href="mailto:jhsiao9@gatech.edu" className="text-blue-600 hover:underline">jhsiao9@gatech.edu</a></li>
              <li>UTA: Amishi Mittal - <a href="mailto:amittal319@gatech.edu" className="text-blue-600 hover:underline">amittal319@gatech.edu</a></li>
              <li>UTA: Jungwoo Moon - <a href="mailto:jmoon318@gatech.edu" className="text-blue-600 hover:underline">jmoon318@gatech.edu</a></li>
              <li>UTA: Matthew Neto - <a href="mailto:mneto6@gatech.edu" className="text-blue-600 hover:underline">mneto6@gatech.edu</a></li>
              <li>UTA: Keshav Parthasarathy - <a href="mailto:kparthas6@gatech.edu" className="text-blue-600 hover:underline">kparthas6@gatech.edu</a></li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-3">Grading</h2>
          <div className="grid grid-cols-2 gap-2">
            <p>Lab Assignments</p>
            <p className="text-right">25%</p>
            <p>Exams (Midterm 1 & 2)</p>
            <p className="text-right">40%</p>
            <p>Final Project</p>
            <p className="text-right">35%</p>
            <p>CIOS Bonus</p>
            <p className="text-right">Up to 1%</p>
          </div>
          <p className="mt-4 text-sm">
            The course grade scale typically follows A = 90, B = 80, etc. This scale may be curved if the average GPA is below 3.00.
          </p>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-3">Course Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Materials</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Syllabus and Lecture Material: Via Canvas</li>
              <li>No required textbook for this course</li>
              <li>Parts kit required for Labs 1-4</li>
              <li>ESP32-C6-DevKitC-1 development board</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Support</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ed Discussion for class questions</li>
              <li>Office hours (see Canvas for schedule)</li>
              <li>Recorded lectures available</li>
              <li>Lab resources in Van Leer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
